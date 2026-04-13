import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        card: 'hsl(var(--card))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        destructive: 'hsl(var(--destructive))',
        ok: 'hsl(var(--ok))',
        warn: 'hsl(var(--warn))',
        bad: 'hsl(var(--bad))',
      },
      borderRadius: {
        lg: 'var(--radius)',
      },
    },
  },
  plugins: [animate],
};

export default config;
