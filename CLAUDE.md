# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gotcha is a type-strong wrapper around the lightning-fast [undici](https://undici.nodejs.org/) network client. It provides enhanced error handling by converting HTTP error status codes (300+) into specific error types rather than throwing generic exceptions.

## Core Architecture

### Main Components

- **`gotcha()`** - Main entry function with overloads for `GotchaRequest` and `Configure` types
- **`request()`** - Wrapper around undici's request that returns typed errors for non-2xx responses
- **Error Types** - Structured error handling via `@yankeeinlondon/kind-error`:
  - `Redirection` (300-399)
  - `ClientError` (400-499) 
  - `ServerError` (500+)
  - `Timeout`

### Type System

- Uses `inferred-types` library for advanced TypeScript inference
- `GotchaRequest` = Parameters of undici's request function
- `Configure` type is placeholder for future configuration features
- Path alias `~/*` maps to `src/*`

### Key Files

- `src/gotcha.ts` - Main entry point with function overloads
- `src/request.ts` - Core request wrapper with error handling logic
- `src/types.ts` - TypeScript type definitions
- `src/errors.ts` - Error type definitions using kind-error
- `src/type-guards/` - Type guard utilities

## Development Commands

```bash
# Package manager (pnpm preferred)
pnpm install          # Install dependencies

# Testing
vitest                # Run tests (when implemented)
pnpm test             # runs all tests
pnpm test foo.test.ts # run specific test file

# Linting & Formatting
eslint .              # Run ESLint
eslint . --fix        # Auto-fix ESLint issues

# TypeScript
tsc --noEmit          # Type checking
```

## Configuration

- **ESLint**: Uses `@antfu/eslint-config` with custom overrides for library development
- **TypeScript**: ES2022 target, ESNext modules, bundler resolution
- **Vitest**: Testing framework (tests not yet implemented)
- **pnpm**: Preferred package manager with lockfile

## Development Notes

- Project is in early development (v0.1.0)
- Configure functionality is not yet implemented
- Tests directory exists but no tests written yet
- Uses path alias `~` for src imports
- Follows strict TypeScript configuration
