/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Disable Tailwind's base/reset styles so they don't fight with Ant Design's
  // own reset. We only use Tailwind for layout & spacing utility classes.
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {
      colors: {
        primary: '#1677ff'
      }
    }
  },
  plugins: []
}
