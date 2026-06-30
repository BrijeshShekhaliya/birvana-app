/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bone: '#FFFCF7',
        coal: '#0E0A07',
        dune: '#E8DDCE',
        ember: '#A86B2A',
        ink: '#16120D',
        moss: '#C6E2DA',
        rust: '#D79C54',
        tide: '#126B65',
      },
      borderRadius: {
        xl: '20px',
        '2xl': '28px',
      },
      boxShadow: {
        soft: '0 18px 40px rgba(22, 18, 13, 0.08)',
      },
    },
  },
  plugins: [],
};
