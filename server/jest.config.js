/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/test/**/*.test.js'],
    setupFiles: ['./test/setup.js'],
    collectCoverageFrom: [
        'controllers/**/*.js',
        'middleware/**/*.js',
        'services/**/*.js',
        'shared/**/*.js',
        'utils/**/*.js',
        '!**/*.config.*',
    ],
    coverageThresholds: {
        global: { lines: 50 },
    },
    testTimeout: 10000,
};
