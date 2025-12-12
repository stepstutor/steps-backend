import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "eslint/config";

import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import jsoncParser from "jsonc-eslint-parser";

import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  
  // Equivalent to:
  //   plugin:@typescript-eslint/recommended
  //   plugin:prettier/recommended
  // ...tseslint.configs.recommended,
  // ...prettierRecommended,

  //
  // ============================
  //   TypeScript + Prettier
  // ============================
  //
  {
    ignores: [".eslintrc.js"],

    files: ["**/*.ts", "**/*.tsx"],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module",
      },
      ecmaVersion: "latest",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },

    plugins: {
      "@typescript-eslint": tseslint,
      prettier,
    },

    rules: {
      //
      // TypeScript
      //
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",

      //
      // Prettier formatting
      //
      "prettier/prettier": ["error"],

      //
      // Logging
      //
      "no-console": "warn",

      //
      // Equality
      //
      eqeqeq: ["error", "always"],

      //
      // Unused variables
      //
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },

    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json"
        }
      }
    }
  },

  //
  // ============================
  //   JSON Files
  // ============================
  //
  {
    files: ["**/*.json"],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      prettier,
    },
    rules: {
      "prettier/prettier": "error",
    },
    ignores: ["package-lock.json"],
  },
]);
