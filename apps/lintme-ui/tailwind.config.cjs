module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      animation: {
        enter: 'fadeIn 0.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-6px) scale(95%)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(100%)' },
        },
      },
    },
  },
  plugins: [],
}
