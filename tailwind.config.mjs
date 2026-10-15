/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F7F4',
        surface: '#FFFFFF',
        primaryText: '#20211F',
        secondaryText: '#74756F',
        border: {
          DEFAULT: '#E5E5DF',
          subtle: '#ECECE7',
          darker: '#D0D0C8'
        },
        accent: {
          DEFAULT: '#5B5BD6',
          hover: '#4949B8',
          subtle: '#F0F0FF',
          border: '#DADAFF'
        },
        success: {
          DEFAULT: '#277A55',
          subtle: '#EDF7F2'
        },
        mentor: {
          DEFAULT: '#B45309',
          bg: '#FEF3C7',
          border: '#FDE68A'
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        'clean': '0 1px 3px rgba(0, 0, 0, 0.03), 0 4px 12px rgba(0, 0, 0, 0.03)',
        'focus-accent': '0 0 0 2px rgba(91, 91, 214, 0.25)',
        'elevated': '0 12px 32px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
};
