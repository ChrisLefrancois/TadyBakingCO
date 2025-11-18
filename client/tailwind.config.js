/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        theseasons: ["'Dancing Script'", "cursive"],
      },
    },
  },
  plugins: [],
};
