/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/tool/*.{vue,js,ts,jsx,tsx}',
    './src/pages/course/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // 自定义颜色配置（匹配代码中出现的非默认Tailwind颜色）
        'submit-red': '#bf1e2e',
        'submit-red-dark': '#a01825',
        'teal-accent': '#00a99d',
        'purple-highlight': '#9333ea'// 匹配text-purple-600的实际使用场景
      },
      keyframes: {
        // 匹配ToolsList中的animate-pop-in动画
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(-10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' }
        },
        // 匹配搜索结果提示的slide-down动画
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        // 匹配ToolDetail中的animate-fade-in动画
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'pop-in': 'popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.2s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']// 匹配代码中font-sans的使用
      }
    }
  },
  plugins: []
}
