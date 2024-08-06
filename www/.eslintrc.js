module.exports = {
    root: true,
    extends: [
      "airbnb",
      "airbnb/hooks",
      "plugin:@typescript-eslint/recommended",
      "prettier",
      "plugin:prettier/recommended",
      "plugin:react/jsx-runtime",
      "plugin:import/recommended",
      "plugin:import/typescript"
    ],
    plugins: [
      "@typescript-eslint",
      "react",
      "prettier"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaFeatures: {
        jsx: true
      },
      ecmaVersion: 2018,
      sourceType: "module",
      project: "./tsconfig.json",
      tsconfigRootDir: __dirname
    },
    rules: {
      "import/no-unresolved": 0,
      "react/jsx-props-no-spreading": 0,
      "react/jsx-filename-extension": [
        1,
        {
          "extensions": [
            ".ts",
            ".tsx"
          ]
        }
      ],
      "prettier/prettier": [
        "error",
        {
          "singleQuote": true,
          "trailingComma": "all",
          "arrowParens": "avoid",
          "endOfLine": "auto",
          "tabWidth": 4,
          "printWidth": 120
        }
      ],
      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": [
        "error"
      ],
      "import/extensions": [
        "error",
        "never",
        {
          "json": "always",
          "ttf": "always",
          "png": "always",
          "jpg": "always"
        }
      ],
      "react/prop-types": 0,
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": [
        "error"
      ],
      "class-methods-use-this": "off",
      "no-useless-constructor": "off"
    }
  }