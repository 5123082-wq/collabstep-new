module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["next/core-web-vitals"],
  ignorePatterns: ["**/dist/**", "**/.next/**"],
  settings: {
    next: {
      rootDir: ["apps/web"]
    }
  },
  rules: {
    "@next/next/no-html-link-for-pages": "off"
  }
};
