/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#fff5f5",
          100: "#ffe3e3",
          300: "#ff8a8a",
          500: "#e53935",
          600: "#c62828",
          700: "#b71c1c",
        },
      },
    },
  },
  plugins: [],
};
