module.exports = {
  extends: ["react-app"],
  rules: {
    "react/jsx-filename-extension": ["error", { extensions: [".js", ".jsx"] }],
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": "off",
    "import/no-anonymous-default-export": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
};
