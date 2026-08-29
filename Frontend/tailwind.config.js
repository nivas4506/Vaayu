/** @type {import('tailwindcss').Config} */
export default {
  content: ["./client/index.html", "./client/src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mint: { 50: '#f4faf7', 100: '#e3f3ea', 200: '#c6e6d4', 300: '#9fd3b7', 400: '#6fb897', 500: '#4a9c7a', 600: '#367f62', 700: '#2c6650', 800: '#265242', 900: '#204438' },
        sage: { 50: '#f6f8f4', 100: '#e9efe3', 200: '#d3dfc8', 300: '#b3c8a3', 400: '#8fac7c', 500: '#71915f', 600: '#57744a', 700: '#455c3c', 800: '#394a33', 900: '#303e2c' },
        ivory: '#FAF9F4',
        status: {
          available: '#3E9C6F',
          limited: '#C98A2C',
          unavailable: '#C1554A',
          unknown: '#8A8F87'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif']
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        glass: '0 8px 32px rgba(30, 60, 45, 0.10)',
        soft: '0 2px 12px rgba(30, 60, 45, 0.08)',
        lift: '0 12px 28px rgba(30, 60, 45, 0.16)'
      },
      borderRadius: { '2xl': '1.25rem', '3xl': '1.75rem' },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.55 } }
      },
      animation: {
        floaty: 'floaty 5s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
