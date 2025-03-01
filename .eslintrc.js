module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:@typescript-eslint/recommended',
    'plugin:tailwindcss/recommended',
    'next/core-web-vitals',
    'prettier',
    "plugin:@next/next/recommended",
  ],
  plugins: ['@typescript-eslint', 'react', 'simple-import-sort', 'unused-imports', 'tailwindcss'],
  settings: {
    react: {
      version: 'detect',
    },
    tailwindcss: {
      callees: ['classnames', 'clsx'], // Detect Tailwind classes in these libraries if used
    },
  },
  rules: {
    // Automatically remove unused imports
    'unused-imports/no-unused-imports': 'error',

    // Sort imports automatically
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': ['error'],
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // React and Next.js imports first
          ['^react$', '^next'],
          // Packages starting with a character or @ (third-party libraries)
          ['^[a-z]', '^@'],
          // Absolute imports (e.g., aliases like ~ or @)
          ['^~', '^@/'],
          // Relative imports (parent folders, current folder)
          ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          // Style imports
          ['^.+\\.s?css$'],
          // Side effect imports (e.g., polyfills)
          ['^\\u0000'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
  },
  globals: {
    module: false,
  },
};