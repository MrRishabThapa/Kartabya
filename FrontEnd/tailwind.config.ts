import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#F27928',
          'primary-light': '#FF8D48',
          'primary-dark': '#C26120',
          'primary-darker': '#9D4F1A',
          'primary-bg': '#FEF2EA',
          'primary-tint': '#FBE0CC',
          secondary: '#EAD0BF',
          'secondary-light': '#EEDBD0',
          'secondary-muted': '#CEB7A8',
          accent: '#FBBF24',
        },
      },
    },
  },
};

export default config;
