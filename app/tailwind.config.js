/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // PestSense brand colors
        brand: {
          green: '#61ce70',
          'green-dark': '#018902',
          'green-deeper': '#006300',
          'green-accent': '#02f103',
          black: '#0d0d0d',
          'button-bg': '#002400',
          'button-bg-dark': '#001b00',
          text: '#4d4d4d',
        },
      },
      fontFamily: {
        geologica: ['Geologica', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        audiowide: ['Audiowide', 'sans-serif'],
      },
      backgroundImage: {
        'hexagon-pattern': "url('/images/hex-pattern.svg')",
      },
    },
  },
  plugins: [],
}
