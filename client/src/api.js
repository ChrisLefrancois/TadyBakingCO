import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE ||
    (window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://tadybakingco.onrender.com"),
});

// Protect only admin order routes with API key
const protectedApiKeyRoutes = [
  "/api/orders",               // GET all orders
  "/api/orders/",              // matches /api/orders/:id, /status etc.
];

api.interceptors.request.use((config) => {
  // Attach JWT admin token if present
  const token = localStorage.getItem("tady_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Attach API key ONLY to protected order routes
  const needsApiKey = protectedApiKeyRoutes.some((route) =>
    config.url.startsWith(route)
  );

  if (needsApiKey) {
    config.headers["x-api-key"] = import.meta.env.VITE_ORDER_API_KEY;
  }

  return config;
});

export default api;
