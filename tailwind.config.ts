import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          primary: '#8B7CF6',       // Soft Lavender
          primaryDark: '#6356C7',   // Deep Purple
          mint: '#A8DCC8',          // Mint Green
          peach: '#FFB38A',         // Warm Peach
          cream: '#FAF9F6',         // Soft Cream Background
          surface: '#FFFFFF',       // Pure White Cards
          charcoal: '#25252B',      // Main Text
          muted: '#73737D',         // Secondary Text
          border: '#E8E7EC',        // Light Gray Border
          success: '#48A868',
          warning: '#F2B84B',
          error: '#E76F6F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;