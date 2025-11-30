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
        'umn-blue': '#1E3A8A',      // UMN Blue
        'umn-yellow': '#F59E0B',    // UMN Yellow
        'umn-lightBlue': '#3B82F6', // UMN Light Blue
      },
    },
  },
  plugins: [],
}
export default config