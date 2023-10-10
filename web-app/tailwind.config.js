/* eslint-env node */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    animatedSettings: {
      animatedSpeed: 1000,
      heartBeatSpeed: 500,
      hingeSpeed: 2000,
      bounceInSpeed: 750,
      bounceOutSpeed: 750,
      animationDelaySpeed: 500,

      classes: ['slide']
    },
    extend: {
      colors: {
        "tg": {
          "bg": "var(--tg-theme-bg-color)",
          "text": "var(--tg-theme-text-color)",
          "hint": "var(--tg-theme-hint-color)",
          "link": "var(--tg-theme-link-color)",
          "btn": "var(--tg-theme-button-color)",
          "btn-text": "var(--tg-theme-button-text-color)",
          "secondary-bg": "var(--tg-theme-secondary-bg-color)",
        },
      },
    },
  },
  plugins: [
    require("daisyui"),
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
  ],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["[data-theme=light]"],
        },
        dark: {
          ...require("daisyui/src/theming/themes")["[data-theme=dark]"],
        },
      }
    ],
  },
}

