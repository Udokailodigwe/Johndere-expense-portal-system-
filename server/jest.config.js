export default {
  testEnvironment: "jest-environment-node",
  transform: {},
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
};
