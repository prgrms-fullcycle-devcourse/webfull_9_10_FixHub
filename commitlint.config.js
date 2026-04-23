const COMMIT_TYPES = [
  'feat',
  'fix',
  'design',
  'test',
  'chore',
  'refactor',
  'comment',
  'rename',
  'remove',
  'style',
  'docs',
  'security',
];

module.exports = {
  parserPreset: {
    parserOpts: {
      headerPattern: /^\[(\w+)\]\s(.+)$/,
      headerCorrespondence: ['type', 'subject'],
    },
  },
  rules: {
    'type-enum': [2, 'always', COMMIT_TYPES],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
  },
};
