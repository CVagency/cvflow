/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0d0c", bg2: "#0e1312", panel: "#121a17", panel2: "#16201c",
        line: "#1f2a26", line2: "#26332e",
        txt: "#e9efec", muted: "#8b9691", muted2: "#5f6b66",
        acc: "#22c55e", accd: "#16a34a",
        wa: "#25d366", tg: "#3aa0e6", gold: "#e5b769", purple: "#a78bfa", pink: "#e879a6", danger: "#ef5f5f",
      },
    },
  },
  plugins: [],
};
