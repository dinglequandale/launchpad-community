module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'functions/node_modules'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    // The project does not use PropTypes; this rule produced ~900 errors of pure noise
    // that buried the real problems (undefined variables, conditional hooks, ...).
    'react/prop-types': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      // Cloud Functions run on Node (CommonJS), not in the browser.
      files: ['functions/**/*.js'],
      env: { node: true, browser: false, es2022: true },
      parserOptions: { sourceType: 'script', ecmaVersion: 2022 },
      rules: {
        'react/display-name': 'off',
      },
    },
    {
      // One-off admin/seed scripts.
      files: ['src/utils/populateOpportunities.js', 'src/utils/seedHighSchools.js', 'src/utils/updateOpportunitiesLocation.js', 'rules-tests/**'],
      env: { node: true },
    },
  ],
}
