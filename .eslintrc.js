module.exports = {
  rules: {
    'react/jsx-filename-extension': [
      2,
      { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    ],
    'react/react-in-jsx-scope': 'off',
  },
  extends: [
    'next/core-web-vitals',
    'airbnb',
    'airbnb/hooks',
    'airbnb-typescript',
    'prettier',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
}
