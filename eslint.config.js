// eslint.config.js
import next from "eslint-config-next";
import prettier from "eslint-plugin-prettier";

export default [
  ...next(),
  {
    plugins: { prettier },
    rules: {
      "prettier/prettier": "warn",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
