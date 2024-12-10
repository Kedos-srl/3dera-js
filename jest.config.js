export const preset = 'ts-jest';
export const testEnvironment = 'node';
export const testMatch = ['**/test/**/*.spec.ts'];
export const collectCoverageFrom = [
  '<rootDir>/src/**/*.ts',
  '!<rootDir>/src/types/**/*.ts',
];
export const globals = {
  'ts-jest': {
    diagnostics: false,
    isolatedModules: true,
  },
};
