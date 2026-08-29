/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#EDE6D6',
          deep: '#E4DBC7',
          line: '#C9C0A8',
        },
        ink: {
          DEFAULT: '#231F16',
          soft: '#4A4535',
        },
        muted: '#6b6349',
        oxblood: {
          DEFAULT: '#8A3223',
          deep: '#6E2619',
        },
        green: '#4B6B4A',
        card: '#F4EFE3',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '2px',
      },
    },
  },
  plugins: [],
}
