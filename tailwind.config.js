// tailwind.config.js
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'immigration': {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    500: '#3b82f6',
                    600: '#2563eb',
                }
            }
        }
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
