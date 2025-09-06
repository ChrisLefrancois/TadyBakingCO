import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from './pages/landingPage'
import FAQ from "./pages/faqPage";
import Items from "./pages/itemsPage";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/items" element={<Items />} />
      </Routes>
      <Footer />
    </Router>

  );
}

export default App;
