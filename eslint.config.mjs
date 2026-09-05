import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The Prisma client is generated code. Linting it reports hundreds of
    // issues in machine-written type declarations that we neither wrote nor
    // can fix, and drowns real findings.
    "generated/**",
  ]),
]);

export default eslintConfig;
