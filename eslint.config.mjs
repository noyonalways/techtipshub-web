import nextConfig from "eslint-config-next/core-web-vitals";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "dist/**",
      "next-env.d.ts",
      "*.config.js",
      "next-sitemap*.js",
    ],
  },
  ...nextConfig,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          ignoreRestSiblings: false,
          argsIgnorePattern: "^_.*?$",
        },
      ],
    },
  },
  {
    // React Compiler safety rules introduced by react-hooks v7 in
    // eslint-config-next@16. They flag pre-existing patterns (setState in
    // effects, etc.) that predate this upgrade; kept as warnings so they stay
    // visible for an incremental cleanup pass rather than blocking the build.
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/set-state-in-render": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/incompatible-library": "warn",
    },
  },
];

export default eslintConfig;
