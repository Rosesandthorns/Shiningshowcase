import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        // Custom Tag Colors from user's CSS
        'tag-sv': '#b520fa',
        'tag-water': '#22cdd6',
        'tag-grass': '#22d622',
        'tag-dark': '#0a0a0a',
        'tag-fire': '#e81d02',
        'tag-electric': '#e9f723',
        'tag-flying': '#ade0ca',
        'tag-pla': '#e0cdad',
        'tag-poison': '#3b0769',
        'tag-ghost': '#221b29',
        'tag-swsh': '#1ce3ed',
        'tag-fairy': '#ff94d2',
        'tag-dragon': '#261c0f',
        'tag-fighting': '#f08d24',
        'tag-steel': '#6e6760',
        'tag-bug': '#9dbf3d',
        'tag-psychic': '#963dbf',
        'tag-rock': '#4d2408',
        'tag-ground': '#8b4513',
        'tag-paradox': '#db8f32',
        'tag-ice': '#aef2e5',
        'tag-fossil': '#452d1c',
        'tag-legendary': '#d435b1',
        'tag-ultra-beast': '#827f7c',
        'tag-normal': '#d3d3d3',
        'tag-alpha': '#fa0505',
        'tag-lgpe': '#fae105',
        'tag-pogo': '#0349fc',
        'tag-mythical': '#f0b6cc',
        // Gradients need to be handled with custom CSS or inline styles if complex
        // For simplicity, 'tag-favourite' and 'tag-starter' will use a solid color or need custom CSS
        'tag-favourite-start': '#ffbf0f', // For gradient, or use a single representative color
        'tag-starter-color': '#e81d02', // Picking one color for simplicity
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
