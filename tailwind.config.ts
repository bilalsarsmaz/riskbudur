import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Theme colors using CSS variables
                'theme-text': 'var(--app-body-text)',
                'theme-subtitle': 'var(--app-subtitle)',
                'theme-border': 'var(--app-border)',
                'theme-accent': 'var(--app-accent)',
                'theme-bg': 'var(--app-body-bg)',
                'theme-surface': 'var(--app-surface)',
                'black': '#040404', // Override black to match app background
            },
        },
    },
    plugins: [],
};

export default config;
