import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import "./App.css";
import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar";
import Footer from "./components/Footer";
import Landing from "./pages/landingPage";
import FAQ from "./pages/faqPage";
import Items from "./pages/itemsPage";
import CartPages from "./pages/CartCheckout";
import CheckoutWrapper from "./pages/CheckoutWrapper";
import OrderConfirmation from "./pages/OrderConfirmation.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";
import AdminOrderDetail from "./pages/AdminOrderDetail";
import AdminLogin from "./pages/AdminLogin";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function AppContent() {
  const token = localStorage.getItem("tady_admin_token");
  const isAdminLoggedIn = Boolean(token);

  const location = useLocation();
  const hideNavbarOn = ["/admin/login"];

  const shouldHideNavbar = hideNavbarOn.includes(location.pathname);

  return (
    <>
      {/* Choose navbar */}
      {!shouldHideNavbar && (
        isAdminLoggedIn ? <AdminNavbar /> : <Navbar />
      )}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/items" element={<Items />} />
        <Route path="/cart" element={<CheckoutWrapper />} />

        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
      </Routes>

      {/* Show footer only on customer pages */}
      {!isAdminLoggedIn && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Elements stripe={stripePromise}>
      <Router>
        <AppContent />
      </Router>
    </Elements>
  );
}
