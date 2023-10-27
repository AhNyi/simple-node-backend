module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'plugin:node/recommended'],
  rules: {
    'no-useless-escape': 'off',
    'no-useless-catch': 'off',
  },
};
