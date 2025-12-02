import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // SKAC Zimbabwe Brand Colors
        primary: {
          50: '#f4f0f9',
          100: '#e8e0f3',
          200: '#d1c1e7',
          300: '#b9a2db',
          400: '#a283cf',
          500: '#5B3A9D', // Main brand purple
          600: '#4a2e7e',
          700: '#38235e',
          800: '#27173f',
          900: '#150c1f',
          950: '#0a0610',
        },
        secondary: {
          50: '#f9f9f9',
          100: '#f3f3f3',
          200: '#e7e7e7',
          300: '#dbdbdb',
          400: '#cfcfcf',
          500: '#8B8B8B', // Brand gray
          600: '#6f6f6f',
          700: '#535353',
          800: '#383838',
          900: '#1c1c1c',
        },
        sermon: '#5B3A9D', // Updated to brand purple
        devotional: '#10b981',
        quarterly: '#8B8B8B', // Updated to brand gray
      },
      fontFamily: {
        sans: ['Raleway', 'system-ui', 'sans-serif'],
        heading: ['Oswald', 'system-ui', 'sans-serif'],
        serif: ['Noto Serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
