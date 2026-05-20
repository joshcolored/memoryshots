import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        moss: '#546B41',
        sage: '#99AD7A',
        parchment: '#DCCCAC',
        cream: '#FFF8EC',
        ink: '#22281D'
      },
      boxShadow: {
        soft: '0 18px 60px rgba(84, 107, 65, 0.16)'
      }
    }
  },
  plugins: []
};

export default config;
