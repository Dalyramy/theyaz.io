import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';
import aspectRatio from '@tailwindcss/aspect-ratio';
import containerQueries from '@tailwindcss/container-queries';

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{js,ts,jsx,tsx,html}",
		"./public/index.html"
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '2rem',
				lg: '4rem',
				xl: '5rem',
				'2xl': '6rem',
			},
			screens: {
				'xs': '320px',    // iPhone SE
				'sm': '375px',    // iPhone Mini
				'md': '390px',    // iPhone Pro
				'lg': '428px',    // iPhone Pro Max
				'xl': '768px',    // Tablets
				'2xl': '1400px'   // Desktop
			}
		},
		extend: {
			spacing: {
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-left': 'env(safe-area-inset-left)',
				'safe-right': 'env(safe-area-inset-right)',
			},
			colors: {
				border: 'hsl(215, 20%, 24%)',
				input: 'hsl(215, 16%, 18%)',
				ring: 'hsl(215, 20%, 40%)',
				background: 'hsl(222, 47%, 11%)',
				foreground: 'hsl(210, 40%, 98%)',
				primary: {
					DEFAULT: 'hsl(221, 83%, 53%)',
					foreground: 'hsl(210, 40%, 98%)',
				},
				secondary: {
					DEFAULT: 'hsl(215, 16%, 47%)',
					foreground: 'hsl(210, 40%, 98%)',
				},
				destructive: {
					DEFAULT: 'hsl(0, 84%, 60%)',
					foreground: 'hsl(210, 40%, 98%)',
				},
				muted: {
					DEFAULT: 'hsl(215, 16%, 24%)',
					foreground: 'hsl(215, 16%, 70%)',
				},
				accent: {
					DEFAULT: 'hsl(265, 83%, 67%)',
					foreground: 'hsl(210, 40%, 98%)',
				},
				popover: {
					DEFAULT: 'hsl(222, 47%, 15%)',
					foreground: 'hsl(210, 40%, 98%)',
				},
				card: {
					DEFAULT: 'hsl(222, 47%, 13%)',
					foreground: 'hsl(210, 40%, 98%)',
				},
				sidebar: {
					DEFAULT: 'hsl(222, 47%, 9%)',
					foreground: 'hsl(210, 40%, 98%)',
					primary: 'hsl(221, 83%, 53%)',
					'primary-foreground': 'hsl(210, 40%, 98%)',
					accent: 'hsl(265, 83%, 67%)',
					'accent-foreground': 'hsl(210, 40%, 98%)',
					border: 'hsl(215, 20%, 24%)',
					ring: 'hsl(215, 20%, 40%)',
				},
				gallery: {
					light: 'hsl(210, 40%, 98%)',
					dark: 'hsl(222, 47%, 11%)',
					accent: 'hsl(221, 83%, 53%)',
					muted: 'hsl(215, 16%, 47%)',
				},
				success: {
					DEFAULT: 'hsl(142, 71%, 45%)', // green
					foreground: 'hsl(210, 40%, 98%)',
				},
				warning: {
					DEFAULT: 'hsl(48, 96%, 53%)', // yellow
					foreground: 'hsl(210, 40%, 98%)',
				},
				info: {
					DEFAULT: 'hsl(201, 96%, 53%)', // blue
					foreground: 'hsl(210, 40%, 98%)',
				},
				brand: {
					DEFAULT: '#059669', // your main green
					light: '#34d399',
					dark: '#065f46',
					foreground: '#fff',
				},
			},
			borderRadius: {
				lg: '1rem',
				md: '0.75rem',
				sm: '0.5rem',
				xl: '1.5rem',
				'2xl': '2rem',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-in-out',
				'float': 'float 3s ease-in-out infinite',
			},
			boxShadow: {
				soft: '0 2px 15px -3px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.08)',
				hover: '0 10px 20px -5px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.10)',
				card: '0 4px 24px 0 rgba(5, 150, 105, 0.08)',
				modal: '0 8px 32px 0 rgba(0,0,0,0.18)',
			},
			// --- Typography Customization ---
			typography: (theme) => ({
				DEFAULT: {
					css: {
						color: theme('colors.foreground'),
						a: { color: theme('colors.primary.DEFAULT'), textDecoration: 'underline', fontWeight: '500' },
						h1: { color: theme('colors.primary.DEFAULT') },
						h2: { color: theme('colors.primary.DEFAULT') },
						h3: { color: theme('colors.primary.DEFAULT') },
						strong: { color: theme('colors.primary.DEFAULT') },
						code: { color: theme('colors.accent.DEFAULT'), backgroundColor: theme('colors.muted.DEFAULT'), padding: '0.2em 0.4em', borderRadius: '0.25rem' },
						blockquote: { color: theme('colors.secondary.DEFAULT'), borderLeftColor: theme('colors.primary.DEFAULT'), fontStyle: 'italic' },
						'ol > li::marker': { color: theme('colors.primary.DEFAULT') },
						'ul > li::marker': { color: theme('colors.accent.DEFAULT') },
						pre: { backgroundColor: theme('colors.muted.DEFAULT'), color: theme('colors.accent.DEFAULT'), borderRadius: '0.5rem' },
					},
				},
				dark: {
					css: {
						color: theme('colors.foreground'),
						a: { color: theme('colors.primary.DEFAULT') },
						h1: { color: theme('colors.primary.DEFAULT') },
						h2: { color: theme('colors.primary.DEFAULT') },
						h3: { color: theme('colors.primary.DEFAULT') },
						strong: { color: theme('colors.primary.DEFAULT') },
						code: { color: theme('colors.accent.DEFAULT'), backgroundColor: theme('colors.muted.DEFAULT'), padding: '0.2em 0.4em', borderRadius: '0.25rem' },
						blockquote: { color: theme('colors.secondary.DEFAULT'), borderLeftColor: theme('colors.primary.DEFAULT'), fontStyle: 'italic' },
						'ol > li::marker': { color: theme('colors.primary.DEFAULT') },
						'ul > li::marker': { color: theme('colors.accent.DEFAULT') },
						pre: { backgroundColor: theme('colors.muted.DEFAULT'), color: theme('colors.accent.DEFAULT'), borderRadius: '0.5rem' },
					},
				},
			}),
		}
	},
	plugins: [
		tailwindcssAnimate,
		typography,
		forms,
		aspectRatio,
		containerQueries,
	],
} satisfies Config;
