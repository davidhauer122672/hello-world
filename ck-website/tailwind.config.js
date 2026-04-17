/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './ck-website/**/*.html',
    './ck-website/**/*.js',
    './ck-command-center/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a1628',
          50: '#e8ecf4',
          100: '#c5cfe3',
          200: '#9eafd0',
          300: '#778fbd',
          400: '#5a79af',
          500: '#3d63a1',
          600: '#2d4d82',
          700: '#1e3762',
          800: '#0f2143',
          900: '#0a1628',
        },
        gold: {
          DEFAULT: '#c9a84c',
          light: '#e2c97e',
          50: '#fdf8eb',
          100: '#f9ecc7',
          200: '#f3d98f',
          300: '#edc657',
          400: '#c9a84c',
          500: '#a68a3a',
          600: '#836c2e',
          700: '#604e22',
          800: '#3d3116',
          900: '#1a140a',
        },
        teal: {
          DEFAULT: '#38bdf8',
          dark: '#0891b2',
        },
        coastal: {
          sand: '#f5f0e8',
          foam: '#e0f2fe',
          deep: '#0d1f3c',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        hero: ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        subhero: ['1.25rem', { lineHeight: '1.6' }],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(10, 22, 40, 0.08)',
        elevated: '0 8px 40px rgba(10, 22, 40, 0.12)',
      },
    },
  },
  plugins: [],
};
