import React from "react";

export default function Footer() {

  return (
    <div className="mt-8 text-center text-sm text-[#4b2e24] bg-[#fbf1e5]">
      <h2 className="bg-[#e5cbc7] inline-block px-6 py-2 rounded-full text-lg font-bold text-[#806154] mb-4 shadow-md">
        Contact Us
      </h2>
      <p className="text-[#5b3c2f]">
          📞 Call/Text: <span className="font-bold">(365) 800-6867</span> <br />
          📧
          <a href="mailto:tadybaking@gmail.com" className="underline">
            tadybaking@gmail.com
          </a>
          <br />
          📷
          <a
            href="https://instagram.com/tadybakingco"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            @tadybakingco
          </a>
        </p>
    </div>
  )


}
