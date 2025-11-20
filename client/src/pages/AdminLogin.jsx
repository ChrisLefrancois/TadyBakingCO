import React, { useState } from "react";
import api from "../api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await api.post("/api/admin/login", { email, password });
      localStorage.setItem("tady_admin_token", res.data.token);
      window.location.href = "/admin/orders";
    } catch {
      alert("Invalid login");
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>

      <form onSubmit={handleLogin} className="space-y-3">
        <input
          className="w-full border p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-black text-white px-4 py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
