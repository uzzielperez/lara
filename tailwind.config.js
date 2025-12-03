/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Filipinas Abroad inspired palette
        primary: {
          50: '#E8F5F3',
          100: '#D1EBE7',
          200: '#A3D7CF',
          300: '#75C3B7',
          400: '#47AF9F',
          500: '#1A9B87',
          600: '#157C6C',
          700: '#105D51',
          800: '#0A3E36',
          900: '#052F29',
          950: '#031F1B',
        },
        // Deep teal - the hero color
        teal: {
          DEFAULT: '#0D4A42',
          light: '#156558',
          dark: '#083630',
        },
        // Warm cream backgrounds
        cream: {
          50: '#FDFCFA',
          100: '#FAF8F4',
          200: '#F5F1E9',
          300: '#EFE9DD',
          400: '#E5DBC9',
          500: '#D6C8AF',
        },
        // Gold accent for CTAs
        gold: {
          50: '#FEF9E7',
          100: '#FCF2C8',
          200: '#F9E591',
          300: '#F6D85A',
          400: '#F3CB23',
          500: '#D4A84B',
          600: '#B8923E',
          700: '#9C7C31',
          800: '#806624',
          900: '#645017',
        },
        // Charcoal for text
        charcoal: {
          DEFAULT: '#2D3436',
          light: '#4A5568',
          dark: '#1A1E1F',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
