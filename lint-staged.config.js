module.exports = {
  '*.{js,cjs,mjs,ts,tsx}': ['prettier --write', 'eslint --fix'],
  '*.{json,css,html,yml,yaml}': ['prettier --write'],
};
