module.exports = {
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/__tests__/**/*.spec.ts', '**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns: ['/src/test.ts$'],
  transformIgnorePatterns: ['node_modules/(?!(\@angular|@taiga-ui|rxjs|@ng-web-apis)/)'],
  moduleNameMapper: {
    '^@angular/core$': '<rootDir>/src/test-mocks/angular-core-mock.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'mjs'],
};
