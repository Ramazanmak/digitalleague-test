import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
    ],
  },

  js.configs.recommended,

  ...pluginVue.configs['flat/essential'],

  {
    files: ['**/*.{js,vue}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.browser,
      },
    },

    plugins: {
      '@stylistic': stylistic,
    },

    rules: {
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-console': 'warn',

      '@stylistic/semi': ['error', 'always'],
      '@stylistic/quotes': [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
    },
  },

  {
    files: ['**/*.vue'],

    rules: {
      'vue/eqeqeq': ['error', 'always'],
      'vue/html-indent': ['error', 2],
    },
  },
];