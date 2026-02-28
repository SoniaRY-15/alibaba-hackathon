function animateValue(el, start, end, duration) {
  let startTime = null;

  function animation(currentTime) {
    if (!startTime) startTime = currentTime;
    const progress = Math.min((currentTime - startTime) / duration, 1);
    el.textContent = (start + (end - start) * progress).toFixed(1);
    if (progress < 1) requestAnimationFrame(animation);
  }

  requestAnimationFrame(animation);
}

const stat = document.querySelector(".stat-num");
animateValue(stat, 0, 98.7, 1500);

document.querySelectorAll('.feature-card').forEach(function(card, idx) {
      ['✦','✧','⋆','·','✦','✧','⋆'].forEach(function(sym, i) {
        var sp = document.createElement('span');
        sp.textContent = sym;
        sp.style.cssText = [
          'position:absolute',
          'pointer-events:none',
          'z-index:1',
          'opacity:0',
          'left:'     + (8 + Math.random() * 80) + '%',
          'top:'      + (8 + Math.random() * 75) + '%',
          'font-size:'+ (7 + Math.random() * 9)  + 'px',
          'color:rgba(255,255,255,0.85)',
          'animation:sparkle-float ' + (2.5 + Math.random()*3.5) + 's ease-in-out ' + (i*0.5 + Math.random()*0.4) + 's infinite'
        ].join(';');
        card.appendChild(sp);
    });
});


