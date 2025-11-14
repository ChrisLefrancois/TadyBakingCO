import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/landingPage";
import FAQ from "./pages/faqPage";
import Items from "./pages/itemsPage";
import CartPages from "./pages/CartCheckout";
import CheckoutWrapper from "./pages/CheckoutWrapper";
import OrderConfirmation from "./pages/OrderConfirmation.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";
import AdminOrderDetail from "./pages/AdminOrderDetail";
import { Check } from "lucide-react";


// 💳 Load your Stripe publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <Elements stripe={stripePromise}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/items" element={<Items />} />
          <Route path="/cart" element={<CheckoutWrapper />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
        </Routes>
        <Footer />
      </Router>
    </Elements>
  );
}

export default App;
