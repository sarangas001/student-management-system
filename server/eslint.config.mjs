import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
            "no-console": ["warn", { allow: ["warn", "error"] }],
            "no-undef": "error",
            "eqeqeq": ["error", "always"],
            "no-var": "error",
            "prefer-const": "warn",
        },
    },
];
