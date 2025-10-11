import React from "react";
import { Mail, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <div className="bg-[#fbf1e5] text-[#4b2e24] py-8 text-center mt-5">
      {/* Contact Us Button */}
      <button
        className="relative w-48 h-16 flex items-center justify-center text-[#806154] font-petitcochon font-bold text-lg transition hover:scale-105 mx-auto"
        style={{
          backgroundImage: "url('/images/tbc cloud bubble.png')",
          backgroundSize: "85% 60%", // bubble fully fills button box
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        CONTACT US
      </button>


      {/* Phone */}
      <p className="font-petitcochon mt-4 text-xl font-bold">
        CALL/TEXT: <span className="font-extrabold">(365) 800-6867</span>
      </p>

      {/* Email & Instagram */}
      <div className="flex items-center justify-center gap-8 mt-4 text-lg">
        {/* Email */}
        <div className="flex items-center gap-2">
          <Mail className="w-7 h-7 text-[#e5a7a7]" />
          <a
            href="mailto:tadybakingco@gmail.com"
            className="font-petitcochon font-bold text-[#a47b67] hover:underline"
          >
            TADYBAKINGCO@GMAIL.COM
          </a>
        </div>

        {/* Instagram */}
        <div className="flex items-center gap-2">
          <Instagram className="w-7 h-7 text-[#e5a7a7]" />
          <a
            href="https://instagram.com/tadybakingco"
            target="_blank"
            rel="noopener noreferrer"
            className="font-petitcochon font-bold text-[#a47b67] hover:underline"
          >
            @TADYBAKINGCO
          </a>
        </div>
      </div>
    </div>
  );
}
