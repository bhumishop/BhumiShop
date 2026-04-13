module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    // Enable parser for Vue 3 <script setup> with TypeScript-like syntax
    ecmaFeatures: {
      globalReturn: false
    }
  },
  plugins: ['vue'],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off'
  },
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    }
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.min.js',
    'tests/',
    'scripts/',
    '.github/',
    'supabase/functions/'
  ]
}
