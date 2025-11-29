import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,

  // Vue SFC rules
  {
    files: ['**/*.vue'],
    languageOptions: { parser: vue.parser },
    plugins: { vue },
    rules: {
      ...vue.configs['vue3-essential'].rules,
    },
  },

  // TS Rules
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { sourceType: 'module' },
    },
    plugins: { '@typescript-eslint': ts },
    rules: {
      ...ts.configs.recommended.rules,

      // Relaxed unused variables rules — allow `_` prefix
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  // Prettier integration — disables all ESLint rules conflicting with Prettier
  prettier,
];
