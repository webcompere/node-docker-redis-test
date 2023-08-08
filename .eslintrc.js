module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    ignorePatterns: ['dist/*'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended', // Use the recommended rules
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
    rules: {
        'no-console': 1,
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
        '@typescript-eslint/ban-ts-comment': 'off',
    },
};
