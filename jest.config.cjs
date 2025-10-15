/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps/web/tests/unit'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  setupFilesAfterEnv: [],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/apps/web/tsconfig.json'
    }
  }
};
