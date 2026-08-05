/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        deep: {
          50: '#eef6f7',
          100: '#d3e9ec',
          200: '#a7d3d9',
          300: '#71b4bd',
          400: '#428e9a',
          500: '#2c6f7c',
          600: '#215763',
          700: '#1a4550',
          800: '#123039',
          900: '#0a1f26',
          950: '#05141a',
        },
        tide: {
          50: '#e6fbfb',
          100: '#c1f3f4',
          200: '#8ee6e9',
          300: '#52d3d9',
          400: '#22b8c2',
          500: '#0f97a3',
          600: '#0d7883',
          700: '#0f5f68',
          800: '#124d54',
          900: '#0f3f45',
        },
        monsoon: {
          coral: '#ff7a59',
          amber: '#ffb648',
          sand: '#f4ede2',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(10, 31, 38, 0.25)',
      },
    },
  },
  plugins: [],
};
