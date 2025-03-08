module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  moduleFileExtensions: ['js', 'json', 'node'],
  testMatch: [
    '<rootDir>/src/**/*.(test|spec).js',
  ],
  testPathIgnorePatterns: ['/node_modules/'],
  resolver: undefined,
};