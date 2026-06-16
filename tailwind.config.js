/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        danger: '#E53E3E',
        warning: '#D69E2E',
        success: '#38A169',
        primary: '#3182CE',
      },
    },
  },
  plugins: [],
};
