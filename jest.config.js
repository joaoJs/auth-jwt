module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['**/src/**/*'],
  coveragePathIgnorePatterns: ['src/tsconfig.json']
};
