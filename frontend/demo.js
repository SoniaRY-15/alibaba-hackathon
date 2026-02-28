function toggleMenu() {
  const menu = document.getElementById("mobileMenu");
  if (menu) menu.classList.toggle("open");
}

// =========== COUNTER ANIMATION ===========
function animateCounters() {
  const counters = document.querySelectorAll(".stat-num[data-target]");
  counters.forEach((counter) => {
    const target = parseFloat(counter.dataset.target);
    const isDecimal = String(target).includes(".");
    const duration = 2000;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = eased * target;
      counter.textContent = isDecimal
        ? val.toFixed(1)
        : Math.floor(val).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

// =========== LIVE FEED (HOME PAGE) ===========
const feedTransactions = [
  { text: "Rp 150.000 — GoPay — SAFE", type: "safe-item", score: 12 },
  { text: "Rp 8.500.000 — New Card — FLAGGED", type: "warn-item", score: 68 },
  { text: "Rp 45.000 — OVO — SAFE", type: "safe-item", score: 8 },
  { text: "Rp 22.000.000 — Crypto — BLOCKED", type: "danger-item", score: 94 },
  { text: "Rp 320.000 — DANA — SAFE", type: "safe-item", score: 15 },
  { text: "Rp 5.750.000 — BCA VA — REVIEW", type: "warn-item", score: 55 },
  { text: "Rp 1.200.000 — Mandiri — SAFE", type: "safe-item", score: 22 },
  {
    text: "Rp 19.800.000 — Emulator — BLOCKED",
    type: "danger-item",
    score: 97,
  },
  { text: "Rp 75.000 — GoPay — SAFE", type: "safe-item", score: 5 },
  { text: "Rp 3.400.000 — New Device — REVIEW", type: "warn-item", score: 61 },
];

let feedIndex = 0;
function addFeedItem() {
  const container = document.getElementById("feedItems");
  if (!container) return;
  const tx = feedTransactions[feedIndex % feedTransactions.length];
  feedIndex++;
  const item = document.createElement("div");
  item.className = `feed-item ${tx.type}`;
  item.innerHTML = `<span>${tx.text}</span><span>Score: ${tx.score}</span>`;
  container.insertBefore(item, container.firstChild);
  if (container.children.length > 5) {
    container.removeChild(container.lastChild);
  }
}

// =========== FRAUD DETECTION ENGINE ===========
let analysisHistory = [];

const RISK_WEIGHTS = {
  amount: {
    weight: 20,
    calc: (v) => {
      const n = parseFloat(v) || 0;
      if (n > 50_000_000) return 100;
      if (n > 20_000_000) return 80;
      if (n > 10_000_000) return 60;
      if (n > 5_000_000) return 35;
      if (n > 1_000_000) return 15;
      return 5;
    },
  },
  merchant: {
    weight: 15,
    calc: (v) => {
      const scores = {
        gambling: 95,
        crypto: 80,
        unknown: 70,
        electronics: 45,
        travel: 30,
        ecommerce: 20,
        food: 5,
        utilities: 5,
        healthcare: 5,
        fashion: 15,
      };
      return scores[v] || 20;
    },
  },
  payMethod: {
    weight: 12,
    calc: (v) => {
      const scores = {
        crypto_wallet: 90,
        card_new: 65,
        card_saved: 15,
        gopay: 10,
        ovo: 10,
        dana: 10,
        bca: 10,
        mandiri: 8,
      };
      return scores[v] || 30;
    },
  },
  txTime: {
    weight: 10,
    calc: (v) => {
      const scores = { dawn: 85, midnight: 70, evening: 25, day: 5 };
      return scores[v] || 30;
    },
  },
  location: {
    weight: 18,
    calc: (v) => {
      const scores = {
        diff_country: 90,
        unknown: 80,
        diff_city: 45,
        same_city: 5,
      };
      return scores[v] || 30;
    },
  },
  device: {
    weight: 15,
    calc: (v) => {
      const scores = { emulator: 98, rooted: 85, new: 55, known: 5 };
      return scores[v] || 30;
    },
  },
  accountAge: {
    weight: 10,
    calc: (v) => {
      const scores = { new_day: 90, new: 65, medium: 25, old: 5 };
      return scores[v] || 30;
    },
  },
  frequency: {
    weight: 15,
    calc: (v) => {
      const scores = { burst: 95, high: 60, normal: 10, first: 35 };
      return scores[v] || 20;
    },
  },
};

const FLAG_RULES = [
  {
    id: "chk_vpn",
    label: "VPN / Proxy detected — masked identity",
    type: "severe",
    score: 25,
  },
  {
    id: "chk_multi",
    label: "Multiple failed attempts preceding this transaction",
    type: "severe",
    score: 30,
  },
  {
    id: "chk_rapid",
    label: "Rapid successive transaction pattern detected",
    type: "warning",
    score: 20,
  },
  {
    id: "chk_unverified",
    label: "Merchant not yet verified by Paylabs",
    type: "warning",
    score: 15,
  },
];

const DYNAMIC_FLAGS = [
  {
    condition: (d) => parseFloat(d.amount) > 20_000_000,
    label: "Transaction amount exceeds high-value threshold (Rp 20M)",
    type: "severe",
  },
  {
    condition: (d) => d.merchant === "gambling",
    label: "Transaction category associated with high fraud risk (gambling)",
    type: "severe",
  },
  {
    condition: (d) => d.device === "emulator",
    label: "Request originated from emulator/virtual device",
    type: "severe",
  },
  {
    condition: (d) => d.device === "rooted",
    label: "Device security compromised (rooted/jailbroken)",
    type: "severe",
  },
  {
    condition: (d) => d.location === "diff_country",
    label: "Login location does not match registered country",
    type: "severe",
  },
  {
    condition: (d) => d.txTime === "dawn",
    label: "Transaction at unusual hour (03:00–06:00 WIB)",
    type: "warning",
  },
  {
    condition: (d) => d.txTime === "midnight",
    label: "Late-night transaction pattern detected",
    type: "warning",
  },
  {
    condition: (d) => d.payMethod === "crypto_wallet",
    label: "Crypto wallet payment — harder to reverse",
    type: "warning",
  },
  {
    condition: (d) => d.payMethod === "card_new",
    label: "New credit card used for first time",
    type: "warning",
  },
  {
    condition: (d) => d.accountAge === "new_day",
    label: "Account created today — high-risk new user",
    type: "severe",
  },
  {
    condition: (d) => d.accountAge === "new",
    label: "Account age less than 3 months",
    type: "warning",
  },
  {
    condition: (d) => d.frequency === "burst",
    label: "Burst transaction activity in past hour",
    type: "severe",
  },
  {
    condition: (d) => d.location === "unknown",
    label: "User location masked or undetectable",
    type: "warning",
  },
  {
    condition: (d) => d.merchant === "crypto",
    label: "Cryptocurrency exchange — irreversible transaction risk",
    type: "warning",
  },
  {
    condition: (d) => d.merchant === "unknown",
    label: "Unverified or unknown merchant category",
    type: "info",
  },
  {
    condition: (d) => d.location === "diff_city",
    label: "Transaction from different city than usual",
    type: "info",
  },
  {
    condition: (d) => d.device === "new",
    label: "First login from this device",
    type: "info",
  },
];

function computeRiskScore(data) {
  let totalWeight = 0,
    weightedScore = 0;
  const breakdown = [];

  for (const [key, config] of Object.entries(RISK_WEIGHTS)) {
    const val = data[key];
    if (!val) continue;
    const raw = config.calc(val);
    weightedScore += raw * config.weight;
    totalWeight += config.weight;
    breakdown.push({
      label: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase()),
      score: raw,
      weight: config.weight,
    });
  }

  let base = totalWeight > 0 ? weightedScore / totalWeight : 0;

  // Bonus from checkboxes
  for (const rule of FLAG_RULES) {
    const el = document.getElementById(rule.id);
    if (el && el.checked) base = Math.min(100, base + rule.score);
  }

  return { score: Math.round(Math.min(100, Math.max(0, base))), breakdown };
}

function getScoreInfo(score) {
  if (score <= 25)
    return {
      label: "LOW RISK",
      color: "color-green",
      decClass: "dec-green",
      ringColor: "#2ECC71",
      decision: "✓ APPROVED",
      recClass: "safe",
      recIcon: "✅",
      recTitle: "Transaction Approved",
      recDesc:
        "This transaction shows no significant risk signals. Proceed normally. Continue monitoring for pattern anomalies.",
    };
  if (score <= 50)
    return {
      label: "MEDIUM RISK",
      color: "color-yellow",
      decClass: "dec-yellow",
      ringColor: "#FFC300",
      decision: "⚠ REVIEW",
      recClass: "warning",
      recIcon: "⚠️",
      recTitle: "Additional Verification Recommended",
      recDesc:
        "Some risk signals detected. We recommend triggering a 2-step verification (OTP) or a short cooling-off period before processing.",
    };
  if (score <= 75)
    return {
      label: "HIGH RISK",
      color: "color-orange",
      decClass: "dec-orange",
      ringColor: "#FF6B35",
      decision: "⚠ FLAGGED",
      recClass: "warning",
      recIcon: "🚨",
      recTitle: "Transaction Flagged for Review",
      recDesc:
        "Multiple risk indicators triggered. Automatically flagged for manual review. Transaction temporarily held pending verification.",
    };
  return {
    label: "CRITICAL RISK",
    color: "color-red",
    decClass: "dec-red",
    ringColor: "#FF4C4C",
    decision: "✕ BLOCKED",
    recClass: "danger",
    recIcon: "🛑",
    recTitle: "Transaction Blocked",
    recDesc:
      "Fraud risk is critically high. Transaction has been automatically blocked. User account flagged for security review. Notify compliance team.",
  };
}

function getFlags(data) {
  const flags = [];
  for (const rule of DYNAMIC_FLAGS) {
    if (rule.condition(data))
      flags.push({ label: rule.label, type: rule.type });
  }
  for (const rule of FLAG_RULES) {
    const el = document.getElementById(rule.id);
    if (el && el.checked) flags.push({ label: rule.label, type: rule.type });
  }
  return flags;
}

async function analyzeTransaction() {
  const data = {
    amount: document.getElementById("amount")?.value,
    merchant: document.getElementById("merchant")?.value,
    payMethod: document.getElementById("payMethod")?.value,
    txTime: document.getElementById("txTime")?.value,
    location: document.getElementById("location")?.value,
    device: document.getElementById("device")?.value,
    accountAge: document.getElementById("accountAge")?.value,
    frequency: document.getElementById("frequency")?.value,
  };

  if (!data.amount || !data.merchant || !data.payMethod) {
    shakeButton();
    return;
  }

  const btn = document.getElementById("analyzeBtn");
  const btnText = document.getElementById("btnText");
  const btnLoader = document.getElementById("btnLoader");
  btn.disabled = true;
  btnText.classList.add("hidden");
  btnLoader.classList.remove("hidden");

  const startTime = performance.now();

  try {
    // Call backend API
    const result = await API_CONFIG.fetch(
      "POST",
      API_CONFIG.endpoints.transactions.analyze,
      data,
    );

    if (result.success) {
      const elapsed = Math.round(performance.now() - startTime);
      const { score, breakdown } = result.data;
      const info = getScoreInfo(score);
      const flags = getFlags(data);
      const conf = result.data.confidence;

      showResult(score, info, breakdown, flags, conf, elapsed);
      addToHistory(data, score, info);
    } else {
      alert("Error: " + (result.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Network error: " + error.message);
  } finally {
    btn.disabled = false;
    btnText.classList.remove("hidden");
    btnLoader.classList.add("hidden");
  }
}

function shakeButton() {
  const btn = document.getElementById("analyzeBtn");
  btn.style.animation = "none";
  btn.style.background = "#FF4C4C";
  setTimeout(() => {
    btn.style.background = "";
    btn.textContent = "";
    const text = document.createElement("span");
    text.id = "btnText";
    text.textContent = "⚠ Fill in Amount, Merchant & Payment first!";
    btn.appendChild(text);
    const loader = document.createElement("span");
    loader.id = "btnLoader";
    loader.className = "btn-loader hidden";
    loader.innerHTML = 'Analyzing<span class="dots">...</span>';
    btn.appendChild(loader);
    setTimeout(() => {
      text.textContent = "🔍 Analyze Transaction";
    }, 2000);
  }, 100);
}

function showResult(score, info, breakdown, flags, conf, ms) {
  const placeholder = document.getElementById("resultPlaceholder");
  const content = document.getElementById("resultContent");
  if (placeholder) placeholder.classList.add("hidden");
  if (content) content.classList.remove("hidden");

  // Score ring animation
  const scoreNum = document.getElementById("scoreNum");
  const ringFill = document.getElementById("ringFill");
  const circumference = 314;
  const offset = circumference - (score / 100) * circumference;

  ringFill.style.stroke = info.ringColor;
  ringFill.style.strokeDashoffset = circumference;
  setTimeout(() => {
    ringFill.style.strokeDashoffset = offset;
  }, 100);

  // Animate number
  let current = 0;
  const interval = setInterval(() => {
    current = Math.min(current + Math.ceil(score / 30), score);
    if (scoreNum) scoreNum.textContent = current;
    if (current >= score) clearInterval(interval);
  }, 40);

  // Labels
  const scoreLabel = document.getElementById("scoreLabel");
  const scoreDecision = document.getElementById("scoreDecision");
  const scoreConf = document.getElementById("scoreConf");
  const analysisTime = document.getElementById("analysisTime");

  if (scoreLabel) {
    scoreLabel.textContent = info.label;
    scoreLabel.className = `score-label ${info.color}`;
  }
  if (scoreDecision) {
    scoreDecision.textContent = info.decision;
    scoreDecision.className = `score-decision ${info.decClass}`;
  }
  if (scoreConf) scoreConf.textContent = conf;
  if (analysisTime) analysisTime.textContent = ms;

  // Breakdown bars
  const rfContainer = document.getElementById("riskFactors");
  if (rfContainer) {
    rfContainer.innerHTML = "";
    const labels = {
      Amount: "Transaction Amount",
      Merchant: "Merchant Category",
      "Pay Method": "Payment Method",
      "Tx Time": "Transaction Time",
      Location: "User Location",
      Device: "Device Security",
      "Account Age": "Account Age",
      Frequency: "Transaction Frequency",
    };
    breakdown.forEach((factor) => {
      const label = labels[factor.label] || factor.label;
      const color =
        factor.score > 75
          ? "#FF4C4C"
          : factor.score > 50
            ? "#FF6B35"
            : factor.score > 25
              ? "#FFC300"
              : "#2ECC71";
      const div = document.createElement("div");
      div.className = "risk-factor";
      div.innerHTML = `
        <span class="rf-label">${label}</span>
        <div class="rf-bar-wrap">
          <div class="rf-bar" style="width:0%; background:${color}" data-target="${factor.score}%"></div>
        </div>
        <span class="rf-val">${factor.score}</span>`;
      rfContainer.appendChild(div);
    });
    setTimeout(() => {
      rfContainer.querySelectorAll(".rf-bar").forEach((bar) => {
        bar.style.width = bar.dataset.target;
      });
    }, 200);
  }

  // Flags
  const flagsList = document.getElementById("flagsList");
  const flagsSection = document.getElementById("flagsSection");
  if (flagsList && flagsSection) {
    flagsList.innerHTML = "";
    if (flags.length === 0) {
      flagsSection.style.display = "none";
    } else {
      flagsSection.style.display = "";
      flags.forEach((flag) => {
        const div = document.createElement("div");
        div.className = `flag-item ${flag.type}`;
        const icon =
          flag.type === "severe" ? "🔴" : flag.type === "warning" ? "🟡" : "ℹ️";
        div.textContent = `${icon} ${flag.label}`;
        flagsList.appendChild(div);
      });
    }
  }

  // Recommendation
  const rec = document.getElementById("recommendation");
  const recIcon = document.getElementById("recIcon");
  const recTitle = document.getElementById("recTitle");
  const recDesc = document.getElementById("recDesc");
  if (rec) {
    rec.className = `recommendation ${info.recClass}`;
    recIcon.textContent = info.recIcon;
    recTitle.textContent = info.recTitle;
    recDesc.textContent = info.recDesc;
  }
}

function resetAnalysis() {
  const placeholder = document.getElementById("resultPlaceholder");
  const content = document.getElementById("resultContent");
  if (placeholder) placeholder.classList.remove("hidden");
  if (content) content.classList.add("hidden");
}

function addToHistory(data, score, info) {
  analysisHistory.unshift({
    data,
    score,
    info,
    time: new Date().toLocaleTimeString("id-ID"),
  });
  renderHistory();
}

function renderHistory() {
  const body = document.getElementById("historyBody");
  const count = document.getElementById("historyCount");
  if (!body) return;
  if (count) count.textContent = analysisHistory.length;

  if (analysisHistory.length === 0) {
    body.innerHTML =
      '<tr class="empty-row"><td colspan="7">No analyses yet. Run your first transaction above!</td></tr>';
    return;
  }

  body.innerHTML = "";
  analysisHistory.forEach((entry, i) => {
    const { data, score, info, time } = entry;
    const scoreColor = info.ringColor;
    const decClass = info.decClass;
    const merchant = data.merchant
      ? data.merchant.charAt(0).toUpperCase() + data.merchant.slice(1)
      : "—";
    const pay = data.payMethod || "—";
    const amt = data.amount
      ? "Rp " + parseInt(data.amount).toLocaleString("id-ID")
      : "—";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="color:var(--text-muted)">${i + 1}</td>
      <td>${amt}</td>
      <td>${merchant}</td>
      <td>${pay}</td>
      <td><span class="score-chip" style="background:${scoreColor}22;color:${scoreColor}">${score}/100</span></td>
      <td><span class="dec-chip ${decClass}">${info.decision}</span></td>
      <td style="color:var(--text-muted)">${time}</td>`;
    body.appendChild(tr);
  });
}

// =========== PRESET LOADER ===========
function loadPreset(type) {
  const presets = {
    safe: {
      amount: "250000",
      merchant: "food",
      payMethod: "gopay",
      txTime: "day",
      location: "same_city",
      device: "known",
      accountAge: "old",
      frequency: "normal",
      chk_vpn: false,
      chk_multi: false,
      chk_rapid: false,
      chk_unverified: false,
    },
    suspicious: {
      amount: "7500000",
      merchant: "electronics",
      payMethod: "card_new",
      txTime: "midnight",
      location: "diff_city",
      device: "new",
      accountAge: "new",
      frequency: "high",
      chk_vpn: false,
      chk_multi: true,
      chk_rapid: false,
      chk_unverified: true,
    },
    fraud: {
      amount: "35000000",
      merchant: "gambling",
      payMethod: "crypto_wallet",
      txTime: "dawn",
      location: "diff_country",
      device: "emulator",
      accountAge: "new_day",
      frequency: "burst",
      chk_vpn: true,
      chk_multi: true,
      chk_rapid: true,
      chk_unverified: true,
    },
  };
  const p = presets[type];
  if (!p) return;
  [
    "amount",
    "merchant",
    "payMethod",
    "txTime",
    "location",
    "device",
    "accountAge",
    "frequency",
  ].forEach((k) => {
    const el = document.getElementById(k);
    if (el) el.value = p[k];
  });
  ["chk_vpn", "chk_multi", "chk_rapid", "chk_unverified"].forEach((k) => {
    const el = document.getElementById(k);
    if (el) el.checked = p[k];
  });
}

// =========== INIT ===========
document.addEventListener("DOMContentLoaded", () => {
  // Counters (home page)
  const counters = document.querySelectorAll(".stat-num[data-target]");
  if (counters.length > 0) {
    setTimeout(animateCounters, 400);
  }

  // Live feed (home page)
  if (document.getElementById("feedItems")) {
    addFeedItem();
    setInterval(addFeedItem, 2200);
  }

  // Scroll fade-in
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.style.opacity = "1";
      });
    },
    { threshold: 0.1 },
  );
  document
    .querySelectorAll(".feature-card, .team-card, .mstat, .context-item")
    .forEach((el) => {
      el.style.opacity = "0";
      el.style.transition = "opacity 0.5s ease, transform 0.3s ease";
      observer.observe(el);
    });
});
