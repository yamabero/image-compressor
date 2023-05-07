module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(css|scss)$": "jest-transform-stub",
  },
  testEnvironment: "jsdom", // node or jsdom
};
