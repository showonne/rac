module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    es6: true,
    browser: true
  },
  plugins: [
    '@typescript-eslint'
  ],
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
    semi: ['error', 'never']
  }
}