/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#050914',
          900: '#0b1224',
          800: '#111c38',
        },
      },
    },
  },
  plugins: [],
};
