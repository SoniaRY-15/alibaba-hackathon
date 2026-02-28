// API Configuration
const API_CONFIG = {
  BASE_URL: "http://localhost:5000/api",

  endpoints: {
    auth: {
      signup: "/auth/signup",
      login: "/auth/login",
      logout: "/auth/logout",
    },
    transactions: {
      analyze: "/transactions/analyze",
      save: "/transactions/save",
      history: "/transactions/history",
    },
  },

  async fetch(method, endpoint, data = null) {
    const url = this.BASE_URL + endpoint;
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const token = localStorage.getItem("token");
    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("API Error:", error);
      return { success: false, error: error.message };
    }
  },
};
