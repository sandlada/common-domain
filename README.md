# @sandlada/common-domain

![npm version](https://img.shields.io/npm/v/@sandlada/common-domain?label=NPM%20Version&labelColor=%2300531f&color=%23a3f5aa)
![GitHub License](https://img.shields.io/github/license/sandlada/common-domain?label=License&labelColor=%2300531f&color=%23a3f5aa)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-%233178c6?labelColor=%232b2d2f)](https://www.typescriptlang.org/)

A **library of reusable domain-layer objects and value objects** for projects
using hexagonal (ports & adapters) architecture. Provides common domain
primitives — such as `Gender` and `Duration` — so you don't have to rewrite
them for every project.

> **Domain-only.** This package contains pure business logic with zero
> infrastructure, framework, or application-layer concerns.

---

## Installation

```bash
npm install @sandlada/common-domain
```

### Dependency: `@sandlada/result`

This library uses `@sandlada/result` for its Result types (`IResultOfT`,
`ok()`, `err()`) and is installed automatically as a dependency.

---

## Usage

### `Gender`

A fixed-set value object with four predefined instances: `Male`, `Female`,
`Other`, and `Unknown`.

```typescript
import { Gender, GenderError } from '@sandlada/common-domain'

// Factory — returns ok(Gender) or err(GenderError)
const result = Gender.From('male')
if (result.isSuccess) {
  console.log(result.value.toString()) // "Male"
}

// Predefined instances
console.log(Gender.Male.value)          // "male"
console.log(Gender.Female.toString())   // "Female"
console.log(Gender.Unknown.value)       // "unknown"

// Enumeration
for (const g of Gender.All) {
  console.log(g.value) // "male", "female", "other", "unknown"
}

// Invalid input produces a domain error
const invalid = Gender.From('invalid')
if (invalid.isFailure) {
  console.log(invalid.error.code) // "InvalidValue"
}
```

### `Duration`

A value object representing a length of time. Supports fixed-length units
(seconds, minutes, hours, days, weeks) and calendar units (months, quarters,
years) — useful for date arithmetic where months have variable lengths.

```typescript
import { Duration } from '@sandlada/common-domain'

// From seconds (single number)
const fiveMinutes = Duration.From(300)
if (fiveMinutes.isSuccess) {
  console.log(fiveMinutes.value.totalSeconds) // 300
}

// From positional arguments: (minutes, seconds)
const oneHalfMin = Duration.From(1, 30)
// (hours, minutes, seconds)
const twoHours = Duration.From(2, 0, 0)

// From a named arguments object
const complex = Duration.From({ hours: 2, minutes: 30, days: 1 })
if (complex.isSuccess) {
  console.log(complex.value.toString()) // "1d 2h 30m"
}

// Calendar-aware construction
const quarter = Duration.From({ months: 3 })
console.log(quarter.value.totalMonths) // 3
```

#### Arithmetic

```typescript
const a = Duration.From(60)        // 1 minute
const b = Duration.From({ hours: 1 }) // 1 hour

const sum = a.add(b)
console.log(sum.totalSeconds) // 3660

const diff = b.subtract(a)
console.log(diff.totalSeconds) // 3540

const neg = Duration.From({ years: 1 }).negate()
console.log(neg.totalMonths) // -12
```

#### Date Operations

Calendar durations automatically clamp days (e.g., Jan 31 + 1 month → Feb 28):

```typescript
const oneMonth = Duration.From({ months: 1 })
const jan31 = new Date(2024, 0, 31)

const febDate = oneMonth.applyTo(jan31)
console.log(febDate.getMonth()) // 1 (February)
console.log(febDate.getDate())  // 29 (clamped to Feb 2024)
```

---

## API

| Export          | Kind         | Description                                                |
| --------------- | ------------ | ---------------------------------------------------------- |
| `Gender`        | Value Object | Fixed-set gender with `Male`, `Female`, `Other`, `Unknown` |
| `GenderError`   | Domain Error | Error for invalid gender values                            |
| `Duration`      | Value Object | Time duration with fixed + calendar units                  |
| `DurationError` | Domain Error | Error for invalid duration values                          |
| `DomainError`   | Base Class   | Abstract base for all domain errors                        |

---

## License

MIT
