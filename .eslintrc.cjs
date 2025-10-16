module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "unused-imports", "import"],
  extends: ["next/core-web-vitals", "plugin:react-hooks/recommended"],
  ignorePatterns: ["**/dist/**", "**/.next/**", "**/postcss.config.js"],
  settings: {
    next: {
      rootDir: ["apps/web"]
    },
    'import/resolver': {
      typescript: {
        project: ['./apps/web/tsconfig.json']
      }
    }
  },
  parserOptions: {
    project: ['./apps/web/tsconfig.json', './tsconfig.eslint.json'],
    tsconfigRootDir: __dirname
  },
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "unused-imports/no-unused-imports": "error",
    "import/no-unresolved": "error",
    "import/order": [
      "warn",
      {
        "newlines-between": "always"
      }
    ],
    "@typescript-eslint/no-floating-promises": "error"
  }
};
