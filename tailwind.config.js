const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [...defaultTheme.fontFamily.sans, "Font Awesome"],
        serif: [...defaultTheme.fontFamily.serif, "Font Awesome"],
      },
    },
  },
  plugins: [],
};
