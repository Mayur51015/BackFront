/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366f1',
                    glow: 'rgba(99, 102, 241, 0.5)',
                },
                secondary: '#a855f7',
                accent: '#22d3ee',
                dark: '#020617',
                'glass-bg': 'rgba(255, 255, 255, 0.03)',
                'glass-border': 'rgba(255, 255, 255, 0.08)',
                'glass-hover': 'rgba(255, 255, 255, 0.06)',
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                heading: ['Space Grotesk', 'sans-serif'],
            },
            animation: {
                'bg-pulse': 'bgPulse 15s ease-in-out infinite alternate',
                'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            },
            keyframes: {
                bgPulse: {
                    '0%': { transform: 'scale(1)' },
                    '100%': { transform: 'scale(1.1)' },
                },
                slideUp: {
                    from: { opacity: '0', transform: 'translateY(30px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
