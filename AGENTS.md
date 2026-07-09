---
name: common-domain
description: >-
  Library of reusable domain objects and value objects for hexagonal
  architecture projects.
---

# common-domain — Agent Instructions

## Project Intro

`@sandlada/common-domain` is a **library** of reusable domain-layer objects and
value objects designed for hexagonal (ports & adapters) architecture. It
provides common domain primitives — such as gender, language, email — that
appear in many projects, so you don't have to reinvent them every time.

This package is **domain-only**: it contains pure business logic with zero
infrastructure, framework, or application-layer concerns.

## Tech Stack

- **Build Tool**: tsgo
- **Result Library**: `@sandlada/result` (ROP & Result Pattern)
  - Domain scope only uses `ok(value)` / `err(error)` factories — no operators
    or async needed inside domain objects.
- **Testing**: Vitest 4.x for unit tests; tests live alongside source files as
  `*.spec.ts`
- **Language**: TypeScript with `strict` mode

## Scope

This library provides:

- Common value objects (e.g., `Gender`, `Language`, `Email`, `PhoneNumber`)
- Common domain errors for those value objects
- Domain aggregates where cross-object invariants exist
- Repository interfaces (ports) for the above aggregates

It does **not** provide:

- Application-layer services, commands, or queries
- Infrastructure adapters (HTTP, database, etc.)
- Framework-specific integrations (React, Vue, etc.)

## Architecture (Hexagonal / Ports & Adapters)

- **Domain** (`src/domain/`) — Framework-agnostic core business logic. Contains
  value objects, aggregates, repository interfaces (ports), and domain errors.
  Zero framework dependencies.

## Coding Conventions

### General

- Use TypeScript strict typing. Avoid `any` — prefer `unknown` if type is not known.
- Access modifiers (`public`, `private`, `protected`) are required for all class members.
- Prefer `const` over `let`. Never use `var`.
- No semicolons — omit all trailing semicolons.
- Use template literals over string concatenation.
- Use optional chaining (`?.`) and nullish coalescing (`??`) where appropriate.
- Use 4 spaces for indentation (tab size = 4).
- Single-line `if` bodies should be written on the same line as the `if`
  statement (e.g., `if (condition) return value;`).
- Library code should be fully tree-shakeable — avoid side effects at module
  scope. Set `"sideEffects": false` in `package.json`.

### Project Structure

```plaintext
src/
├── domain/
│   ├── aggregates/       # Domain entities / aggregates
│   ├── commons/          # Shared domain primitives
│   ├── errors/           # Domain error classes with static error codes
│   ├── primitives/       # Base types / interfaces
│   ├── repositories/     # Repository interfaces (ports)
│   └── value-objects/    # Immutable value objects
└── index.ts               # Barrel export (entry point)
```

### Naming Conventions

- **Types**: `camelCase.ts` with descriptive names (e.g., `gender.ts`, `language.ts`)
- **Interfaces**: `xxx.interface.ts` (e.g., `gender-repository.interface.ts`)
- **Aggregates**: `xxx.aggregate.ts` (e.g., `person.aggregate.ts`)
- **Value Objects**: `xxx.vo.ts` (e.g., `gender.vo.ts`)
- **Domain Errors**: `xxx.error.ts` (e.g., `gender.error.ts`)
- **Static methods / static fields / const constants**: Must start with an
  uppercase letter (PascalCase), e.g., `static From(...)`, `static DefaultValue`,
  `const MaxRetryCount = 3`.

### Prefer From Factory Methods for Aggregates & Value Objects

Domain-layer entities should use **From** factory methods for construction
rather than public constructors.

### Constructor Args Pattern

For value objects, aggregates, queries, commands, or any object requiring
construction parameters, use a typed `IXxxConstructorArgs` interface with
required properties instead of a parameterless constructor with settable
properties:

- **Domain layer** (aggregates, value objects): `IXxxConstructorArgs`
  (prefixed with `I`)
- **Application / API layer** (commands, queries, requests): `IXxxArgs`
  (prefixed with `I`)

This guarantees objects are created in a valid state and validation can be
enforced in the constructor.

### Domain Errors

- All domain error classes must be placed in `src/domain/errors/`, organized by
  feature (e.g., `gender.error.ts`).
- Each domain error class must extend `DomainError` from
  `src/domain/primitives/domain-error.ts`.
- Error instances must be defined as `static readonly` properties (for fixed
  messages) or `static` factory methods (for dynamic messages) on the error
  class, with a private constructor.
- Error codes must be PascalCase human-readable strings (e.g., `InvalidValue`,
  `NotFound`).
- Usage: `GenderError.InvalidValue(value)` — never instantiate errors inline
  with `new`.

### Barrel Exports

- `src/index.ts` is the public API surface of the library.
- Every publicly exported type, class, or function must be re-exported from
  `src/index.ts`.
- Internal modules (helpers, internal types) are **not** re-exported.

### Testing (Vitest)

- Use Vitest as the test runner. Tests live alongside source files as
  `*.spec.ts`.
- Import `describe`, `it`, `expect` explicitly from `vitest` (no globals).
- Focus on pure-logic tests: Result pattern, value object invariants, domain
  errors, aggregate business rules.
- Use `describe`/`it` blocks for organization; prefer `it.each` for
  data-driven cases.
- Async tests: use `async/await` with `expect().resolves` / `expect().rejects`
  for promise assertions.
- Run `npm test` for watch mode during development, `npm run test:run` for CI.
- Test files are excluded from production builds (e.g., via
  `tsconfig.build.json`).

## Commands

- `npm run build` — Build the library for production
- `npm test` — Run tests in watch mode
- `npm run test:run` — Run tests once (CI mode)
- `npm run lint` — Run linting
