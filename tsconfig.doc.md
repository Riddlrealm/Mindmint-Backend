# tsconfig.json — quick reference

This file is consumed by NestJS CLI, ESLint, and `tsc --noEmit` for typecheck.
Configuration choices explained:

- `module: commonjs` — required by NestJS at runtime.
- `target: ES2020` — node 20 ships with full ES2020 support; higher targets
  force needless polyfills for our dependencies and break some legacy libs.
- `moduleResolution: node` — class Node-style resolution; matches the
  package layout chosen by NestJS.
- `strictNullChecks: false` and `noImplicitAny: false` — open to
  `any`/`undefined` for faster migration of legacy modules. Will tighten
  under the strict-mode migration plan tracked separately.
- `resolveJsonModule: true` — needed for `.json` imports in config code
  (e.g. `import package from '../package.json'`).
- `esModuleInterop: true` — default ESM-style interop so `import x from
  'commonjs-pkg'` doesn't require `* as`.
- `skipLibCheck: true` — required to compile against the NestJS ecosystem
  without stopping on third-party typings.
- `incremental: true` — saves `.tsbuildinfo` for fast re-runs.
- `noFallthroughCasesInSwitch: false` — intentional; legacy switch blocks
  rely on fall-through.
