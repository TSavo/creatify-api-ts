module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // Make sure this is always the last element in the array
  ],
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  rules: {
    // Add custom rules here
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: ['dist', 'node_modules', 'coverage'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
};
