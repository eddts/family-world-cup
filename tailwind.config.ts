import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#fff7df',
        ink: '#111111',
        posterRed: '#ef3340',
        posterBlue: '#0057b8',
        posterYellow: '#ffd800',
        posterGreen: '#009f4d',
      },
      boxShadow: {
        hard: '8px 8px 0 #111111',
        hardSm: '4px 4px 0 #111111',
      },
      fontFamily: {
        display: ['Impact', 'Haettenschweiler', 'Arial Black', 'sans-serif'],
        body: ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
