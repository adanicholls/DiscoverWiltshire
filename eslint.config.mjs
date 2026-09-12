import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The old static prototype (js/, css/, root *.html) is being ported
    // into src/ page by page rather than all at once — see README.md.
    // Not part of the Next.js app, so not worth linting until it's gone.
    "js/**",
    "css/**",
  ]),
]);

export default eslintConfig;
