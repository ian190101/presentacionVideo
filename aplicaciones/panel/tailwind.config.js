export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        robot: {
          rojo: "#d40511",
          rojoOscuro: "#8d1118",
          grafito: "#111827",
          tinta: "#0b1320",
          cian: "#22c7dd",
          superficie: "#f6f8fb"
        }
      },
      boxShadow: {
        panel: "0 12px 34px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
