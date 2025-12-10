import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE ||
    (window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://tadybakingco.onrender.com"),
});

// Protected admin routes
const protectedOrderRoutes = ["/api/orders"];
const protectedItemRoutes = [
  "/api/items/create",
  "/api/items/items" // <-- IMPORTANT: do NOT include trailing slash
];

api.interceptors.request.use((config) => {
  // 🔐 Admin JWT
  const token = localStorage.getItem("tady_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 🔐 Order API key
  if (protectedOrderRoutes.some((r) => config.url.startsWith(r))) {
    config.headers["x-api-key"] = import.meta.env.VITE_ORDER_API_KEY;
  }

  // 🔐 Item API key (CREATE, UPDATE, DELETE)
  if (protectedItemRoutes.some((r) => config.url.startsWith(r))) {
    config.headers["x-api-key"] = import.meta.env.VITE_ITEMS_API_KEY;
  }

  return config;
});

export default api;
