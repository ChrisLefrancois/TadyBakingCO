import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE ||
    (window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://tadybakingco.onrender.com"),
});

api.interceptors.request.use((config) => {
  config.headers["x-api-key"] = import.meta.env.VITE_ORDER_API_KEY;
  return config;
});

export default api;
