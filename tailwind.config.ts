import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        income: '#16a34a',
        expense: '#dc2626',
      },
      fontFamily: {
        nastaliq: ['"Noto Nastaliq Urdu"', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
