import type { Config } from 'tailwindcss';

export default {
  content: [
    './app.vue',
    './pages/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './plugins/**/*.{js,ts}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#135bec',
        'accent-gold': '#C5A059',
        'background-light': '#f6f6f8',
        'background-dark': '#101622',
        'serene-beige': '#F9F7F2',
      },
      fontFamily: {
        'display': ['Public Sans', 'sans-serif'],
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
        'lg': '1rem',
        'xl': '1.5rem',
        'full': '9999px',
      },
    },
  },
  plugins: [],
} satisfies Config;
