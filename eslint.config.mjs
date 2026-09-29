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
  {
    // Keeps hardcoded UI text out of components:
    // - jsx-no-literals covers JSX text children only. ignoreProps is on, or the
    //   rule would flag every className and aria-hidden="true".
    // - no-restricted-syntax covers user-visible text in accessibility
    //   attributes, which jsx-no-literals can't see.
    // Vendored trees (bklit, ui) are excluded globally.
    files: ['src/components/**/*.tsx', 'src/App.tsx', 'src/app/**/*.tsx'],
    rules: {
      'react/jsx-no-literals': [
        'error',
        {
          noStrings: true,
          ignoreProps: true,
          allowedStrings: [
            // Punctuation and symbols that carry no language.
            '·',
            '—',
            '–',
            '›',
            '≈',
            '%',
            '/',
            '×',
            ':',
            ',',
            '(',
            ')',
            // Proper nouns, which stay as they are in every language: the
            // header's logo mark, the statistics portal, and the author.
            'JP',
            'e-Stat',
            'RetroHazard',
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'JSXAttribute[name.name=/^(aria-label|aria-description|aria-placeholder|aria-roledescription|title|placeholder|alt)$/] > Literal',
          message:
            'User-visible text must come from the locale catalogue — use t() from useLocale() instead of a string literal.',
        },
      ],
    },
  },
  prettier,
];
