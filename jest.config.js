const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig')

module.exports = {
    testEnvironment: 'node',
    testRegex: '/test/.*\\.(test|spec)?\\.(ts|tsx)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'd.ts'],
    reporters: [
        "default",
        ["jest-junit", {
            outputDirectory: 'reports',
            outputName: 'junit.xml',
        }],
    ],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' } ),
    transform: {
        '^.+\\.ts?$': 'ts-jest'
    },
    collectCoverage: true,
    setupFiles: ["<rootDir>/test/setup.ts"]
};
