module.exports = {
  root: true,
  ignorePatterns: [".eslintrc.cjs", "vite.config.ts", "codegen.ts"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
    project: "./tsconfig.json",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["@typescript-eslint", "unused-imports", "react-refresh"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:react-hooks/recommended",
  ],
  rules: {
    "no-unused-vars": "off",
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["tinybase/ui-react/*"],
            message:
              "Please import from store.ts instead as this file exports the same functions but with schema checking support.",
          },
        ],
      },
    ],
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "linebreak-style": ["error", "unix"],
    "unused-imports/no-unused-imports": "error",
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".mts"],
      },
    },
    react: {
      version: "detect",
    },
  },
};
