const { colors } = require(`tailwindcss/defaultTheme`);

module.exports = {
  purge: ["./components/**/*.js", "./pages/**/*.js"],
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          md: "2rem",
        },
      },
      backgroundImage: theme => ({
        'rbx-forest': "url('https://rbx-backend-media.s3.sa-east-1.amazonaws.com/floresta_min_min_61154ca14d.webp')",
        'rbx-white': "url('https://rbx-backend-media.s3.sa-east-1.amazonaws.com/bg_bloco_min_8981be1e00.webp')",
        'rbx-green': "url('https://rbx-backend-media.s3.sa-east-1.amazonaws.com/bg_h1_d355630fd8.webp')"
       })
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
