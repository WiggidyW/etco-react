/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      transitionProperty: {
        'filter': 'filter',
        'max-height': 'max-height',
      },
      colors: {
        'light-red-active': 'var(--color-light-red-active)',
        'light-red-base': 'var(--color-light-red-base)',
        'light-red-faded': 'var(--color-light-red-faded)',

        'light-green-active': 'var(--color-light-green-active)',
        'light-green-base': 'var(--color-light-green-base)',
        'light-green-faded': 'var(--color-light-green-faded)',
        
        'light-blue-active': 'var(--color-light-blue-active)',
        'light-blue-base': 'var(--color-light-blue-base)',
        'light-blue-faded': 'var(--color-light-blue-faded)',

        'background-active': 'var(--color-background-active)',
        'background-base': 'var(--color-background-base)',
        'background-faded': 'var(--color-background-faded)',
        'background-text': 'var(--color-background-text)',
        'background-border': 'var(--color-background-border)',

        'bookend-active': 'var(--color-bookend-active)',
        'bookend-base': 'var(--color-bookend-base)',
        'bookend-faded': 'var(--color-bookend-faded)',
        'bookend-text': 'var(--color-bookend-text)',
        'bookend-border': 'var(--color-bookend-border)',

        'primary-active': 'var(--color-primary-active)',
        'primary-base': 'var(--color-primary-base)',
        'primary-faded': 'var(--color-primary-faded)',
        'primary-text': 'var(--color-primary-text)',
        'primary-border': 'var(--color-primary-border)',
        'primary-tweak': 'var(--color-primary-tweak)',

        'secondary-active': 'var(--color-secondary-active)',
        'secondary-base': 'var(--color-secondary-base)',
        'secondary-faded': 'var(--color-secondary-faded)',
        'secondary-text': 'var(--color-secondary-text)',
        'secondary-border': 'var(--color-secondary-border)',

        'success-active': 'var(--color-success-active)',
        'success-base': 'var(--color-success-base)',
        'success-faded': 'var(--color-success-faded)',
        'success-text': 'var(--color-success-text)',
        'success-border': 'var(--color-success-border)',
        'success-dark': 'var(--color-success-dark)',

        'failure-active': 'var(--color-failure-active)',
        'failure-base': 'var(--color-failure-base)',
        'failure-faded': 'var(--color-failure-faded)',
        'failure-text': 'var(--color-failure-text)',
        'failure-border': 'var(--color-failure-border)',
        'failure-dark': 'var(--color-failure-dark)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      minHeight: {
        'min': 'min-content',
      },
      padding: {
        'inherit': 'inherit',
      },
      brightness: {
        '10': '.1',
        '25': '.25',
      }
    },
  },
  plugins: [],
}
