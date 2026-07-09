# @sandlada/common-domain

![npm version](https://img.shields.io/npm/v/@sandlada/common-domain?label=NPM%20Version&labelColor=%2300531f&color=%23a3f5aa)
![GitHub License](https://img.shields.io/github/license/sandlada/common-domain?label=License&labelColor=%2300531f&color=%23a3f5aa)

A **library of reusable domain-layer objects and value objects** for projects
using hexagonal (ports & adapters) architecture. Provides common domain
primitives — such as `Gender`, `Language`, `Email` — so you don't have to
rewrite them for every project.

> **Domain-only.** This package contains pure business logic with zero
> infrastructure, framework, or application-layer concerns.

---

## Installation

```bash
npm install @sandlada/common-domain
```

### Peer Dependency: `@sandlada/result`

This library uses `@sandlada/result` for its Result types and is installed
automatically as a dependency.

---

## Usage

### Value Objects

```typescript
import { Gender } from '@sandlada/common-domain';

const genderResult = Gender.From('male');
if (genderResult.isSuccess) {
  console.log(genderResult.value); // Gender instance
}
```

### Domain Errors

```typescript
import { Gender, GenderError } from '@sandlada/common-domain';

const result = Gender.From('invalid');
if (result.isFailure) {
  console.log(result.error); // GenderError.InvalidValue('invalid')
}
```

---

## License

MIT
