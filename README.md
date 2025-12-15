# Zod Deep Partial

[![npm version](https://badge.fury.io/js/zod-deep-partial.svg)](https://badge.fury.io/js/zod-deep-partial)
[![CI](https://github.com/amirfarzamnia/zod-deep-partial/actions/workflows/ci.yaml/badge.svg)](https://github.com/amirfarzamnia/zod-deep-partial/actions/workflows/ci.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/zod-deep-partial.svg)](https://www.npmjs.com/package/zod-deep-partial)

A utility to recursively make all properties in a Zod schema optional.

> [!NOTE]
> `zod-deep-partial` **v1.2.0 and above** requires **zod v4**.
> If you are using **zod v3**, please use `zod-deep-partial` **versions prior to v1.2.0**.

## Description

`zod-deep-partial` is a lightweight, zero-dependency package that provides a single function, `zodDeepPartial`. This function takes any Zod schema and returns a new schema where every property at every level of nesting is optional. This is particularly useful for creating schemas for patch updates or for handling incomplete data structures without sacrificing the benefits of Zod's validation.

## Features

- **Deeply Partial:** Makes all properties of a Zod schema optional, including nested objects.
- **Type-Safe:** Preserves Zod's powerful type inference.
- **Comprehensive Support:** Works with a wide range of Zod types:
  - Objects (`z.object`)
  - Arrays (`z.array`)
  - Unions (`z.union`)
  - Discriminated Unions (`z.discriminatedUnion`)
  - Intersections (`z.intersection`)
  - Tuples (`z.tuple`)
  - Records (`z.record`)
  - Maps (`z.map`)
  - Lazy Schemas (`z.lazy`)
- **Zero Dependencies:** Relies only on `zod` as a peer dependency.

## Installation

Install the package using your favorite package manager:

**npm**

```bash
npm install zod-deep-partial
```

**yarn**

```bash
yarn add zod-deep-partial
```

**pnpm**

```bash
pnpm add zod-deep-partial
```

## Usage

Here's a simple example of how to use `zodDeepPartial`:

```typescript
import { z } from "zod";
import { zodDeepPartial } from "zod-deep-partial";

// 1. Define your base schema
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  profile: z.object({
    bio: z.string(),
    avatar: z.string().url(),
  }),
  tags: z.array(z.string()),
});

// 2. Create the deep partial schema
const partialUserSchema = zodDeepPartial(userSchema);

// 3. Use the partial schema for validation

// All of these are now valid:
partialUserSchema.parse({}); // ✅
partialUserSchema.parse({ name: "John Doe" }); // ✅
partialUserSchema.parse({ profile: {} }); // ✅
partialUserSchema.parse({ profile: { bio: "A developer" } }); // ✅
partialUserSchema.parse({ tags: ["developer"] }); // ✅

// Type inference is preserved
type PartialUser = z.infer<typeof partialUserSchema>;
/*
{
  name?: string | undefined;
  email?: string | undefined;
  profile?: {
    bio?: string | undefined;
    avatar?: string | undefined;
  } | undefined;
  tags?: (string | undefined)[] | undefined;
}
*/
```

## API

### `zodDeepPartial<T extends z.core.SomeType>(schema: T): DeepPartial<T>`

- **`schema`**: The Zod schema to make deeply partial.
- **Returns**: A new Zod schema where all properties are recursively optional.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on the [GitHub repository](https://github.com/amirfarzamnia/zod-deep-partial).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
