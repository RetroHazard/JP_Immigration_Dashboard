module.exports = {
  parser: '@typescript-eslint/parser',
  // Vendored Bklit UI sources keep upstream formatting for easy diffing
  ignorePatterns: ['src/components/bklit/**', 'src/components/ui/**'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
    'prettier',
    "plugin:@next/next/recommended",
  ],
  plugins: ['@typescript-eslint', 'react', 'simple-import-sort', 'unused-imports'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Automatically remove unused imports
    'unused-imports/no-unused-imports': 'error',

    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': ['error'],
    "@typescript-eslint/no-require-imports": "off",
    
    // Sort imports automatically
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