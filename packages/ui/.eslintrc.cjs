/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  ignorePatterns: [".eslintrc.cjs"],
  extends: ["@authfill/eslint/index.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
};
