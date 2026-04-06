export default {
  testEnvironment: "node",
  transform: {},
  moduleNameMapping: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: [
    "**/tests/unit/**/*.test.js",
    "**/tests/integration/**/*.test.js",
  ],
  collectCoverageFrom: [
    "models/**/*.js",
    "controllers/**/*.js",
    "middleware/**/*.js",
    "routes/**/*.js",
    "!**/node_modules/**",
  ],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  transformIgnorePatterns: ["node_modules/(?!(mongodb-memory-server)/)"],
  moduleFileExtensions: ["js", "json"],
  moduleDirectories: ["node_modules", "<rootDir>"],
};
