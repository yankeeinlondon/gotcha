# AGENTS.md

## Development Commands

- **Install**: `pnpm install`
- **Build**: `pnpm build` (uses tsdown)
- **Runtime Test**: `pnpm test` (runs all tests with vitest; note: runtime validation but not type)
- **Type Test**: `pnpm types` (runs all tests with typed-tester; note: type validation but not runtime)
- **Test Single File**: `pnpm test <filename>`
- **Lint**: `pnpm lint` (uses eslint with @antfu/eslint-config)
- **Lint Fix**: `pnpm lint --fix`
- **Type Check**: `tsc --noEmit`

## Code Style Guidelines

### Imports

- Use path alias `~/` for src imports (e.g., `import { gotcha } from "~/gotcha"`)
- Prefer named imports over default imports
- Group imports: node built-ins, external packages, internal imports

### Formatting

- 4-space indentation (ESLint enforces)
- Double quotes for strings (ESLint enforces)
- Semicolons required (ESLint enforces)
- Trailing commas in multiline objects/arrays (ESLint enforces)

### Types

- Use TypeScript strictly (strict: true in tsconfig)
- Leverage `inferred-types` library for advanced inference
- Type narrow with provided guards (`isOk`, `timedOut`, etc.)
- Define interfaces for complex objects

### Naming Conventions

- camelCase for variables/functions
- PascalCase for types/interfaces/classes
- UPPER_CASE for constants
- Descriptive names over abbreviations

### Error Handling

- Use gotcha's typed errors instead of throwing
- Check `isOk(result)` for success cases
- Handle specific error kinds: redirection, client-error, server-error, timeout
- Use `result.toString()` for formatted error messages

### Testing

- Use vitest with describe/it blocks
- Test both runtime behavior and type safety
- Include tests for success, error, timeout cases
- Use setup files for shared test configuration
