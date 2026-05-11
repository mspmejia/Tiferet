import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Identidad visual Tiferet Salud
        brand: {
          blue: {
            50:  '#EFF6FF',
            100: '#DBEAFE',
            400: '#3B82F6',
            600: '#1E50A2',  // Azul corporativo principal
            700: '#1D4ED8',
            900: '#1E3A8A',
          },
          orange: {
            50:  '#FFF7ED',
            100: '#FFEDD5',
            400: '#FB923C',
            600: '#F97316',  // Naranja corporativo principal
            700: '#EA580C',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
