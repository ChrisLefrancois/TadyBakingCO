import React from 'react';

export default function LandingPage() {
  return (
    <div className="main-container items-center bg-[#f0d8cc]">
      {/* Header */}
      <header className="w-full bg-[#9c6f5a] text-white py-6 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-wide">TADY BAKING CO</h1>
      </header>

      {/* Main section: fills remaining space */}
      <main className="flex-1 flex flex-col items-center justify-between py-10 px-4">
        {/* Top Bubbles */}
        <div className="flex flex-wrap gap-4 justify-center">
          <SpeechBubble>FRESH COOKIES?!?</SpeechBubble>
          <SpeechBubble className="transform translate-y-24">BUTTER TARTS TOO!</SpeechBubble>
          <SpeechBubble className="transform translate-y-8">in AJAX!?</SpeechBubble>
        </div>

        {/* Order Now Button */}
        <div className="bg-[#cfae91] px-12 py-8 rounded-[50px] shadow-xl text-center">
          <h2 className="text-5xl font-bold text-[#4b2e24]">ORDER NOW!</h2>
        </div>

        {/* Footer Navigation */}
        <div className="flex gap-6 flex-wrap justify-center">
          <NavBubble>ABOUT US</NavBubble>
          <NavBubble className="transform -translate-y-6">FAQ</NavBubble>
          <NavBubble>CONTACT US</NavBubble>
        </div>
      </main>
    </div>
  );
}

function SpeechBubble({ children, className = "" }) {
  return (
    <div className={`relative bg-white px-6 py-3 rounded-xl border-2 border-[#4b2e24] shadow text-[#4b2e24] font-semibold text-xl ${className}`}>
      {children}
      <div className="absolute -bottom-2 left-6 w-3 h-3 bg-white border-l-2 border-b-2 border-[#4b2e24] rotate-45"></div>
    </div>
  );
}

function NavBubble({ children, className = "" }) {
  return (
    <button className={`bg-[#cfae91] text-[#4b2e24] px-6 py-3 rounded-full font-semibold shadow-md hover:scale-105 transition text-lg ${className}`}>
      {children}
    </button>
  );
}
