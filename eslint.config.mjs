// eslint.config.mjs — ESLint 9 flat config (replaces .eslintrc.js and the
// duplicate eslintConfig block that used to live in package.json).
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import { FlatCompat } from '@eslint/eslintrc';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  {
    ignores: [
      // Vendored sources keep upstream formatting for easy diffing
      'src/components/bklit/**',
      'src/components/ui/**',
      'build/**',
      '.next/**',
      'node_modules/**',
      'src/buildInfo.js',
    ],
  },
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['**/*.{ts,tsx,js,mjs,mts}'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-require-imports': 'off',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^react$', '^next'],
            ['^[a-z]', '^@'],
            ['^~', '^@/'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ['^.+\\.s?css$'],
            ['^\\u0000'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
  prettier,
];
