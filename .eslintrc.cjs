/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  'root': true,
  'extends': [
    'eslint:recommended',
  ],
  'env': {
    browser: true,
    node: true,
    es6: true
  },
  'rules': {
    'no-var': 'warn',
    'eqeqeq': 'warn',
    'handle-callback-err': 'error',
    'no-console': 0,
    'linebreak-style': 0,
    'react/no-unescaped-entities': 0,
    'quotes': [ 'error', 'single', { avoidEscape: true } ],
    'semi': ['error', 'always'],
    'semi-spacing': 'error',
    'spaced-comment': ['warn', 'always'],
    'jsx-quotes': ['error', 'prefer-single'],
    '@typescript-eslint/no-explicit-any': 0,
  }
};
