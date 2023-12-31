/** @type {import("eslint").Linter.Config} */
module.exports = {
  ...require("@local/eslint-config/generate-block-config.cjs")(__dirname),
  rules: {
    "unicorn/import-style": [
      "error",
      {
        styles: {
          react: { named: false },
        },
      },
    ],
  },
};
