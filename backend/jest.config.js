module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  testMatch: ['**/src/tests/**/*.test.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
};
