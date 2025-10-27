import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE ||
    (window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://tadybakingco.onrender.com"),
});

export default api;
