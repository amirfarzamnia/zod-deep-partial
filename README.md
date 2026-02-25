# Zod Deep Partial

[![NPM Version](https://img.shields.io/npm/v/zod-deep-partial?style=flat-square&logo=npm&logoColor=white&color=blue)](https://www.npmjs.com/package/zod-deep-partial)
[![NPM Downloads](https://img.shields.io/npm/dm/zod-deep-partial?style=flat-square&logo=icloud&logoColor=white&color=blue)](https://www.npmjs.com/package/zod-deep-partial)
[![NPM License](https://img.shields.io/npm/l/zod-deep-partial?style=flat-square&logo=spdx&logoColor=white&color=blue)](https://www.npmjs.com/package/zod-deep-partial)
[![NPM Type Definitions](https://img.shields.io/npm/types/zod-deep-partial?style=flat-square&logo=typescript&logoColor=white&color=blue)](https://www.npmjs.com/package/zod-deep-partial)
[![NPM Last Update](https://img.shields.io/npm/last-update/zod-deep-partial?style=flat-square&logo=clockify&logoColor=white&color=blue)](https://www.npmjs.com/package/zod-deep-partial)

A utility to recursively make all properties in a Zod schema optional.

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
  - Sets (`z.set`)
  - Promises (`z.promise`)
  - Lazy Schemas (`z.lazy`)
  - Readonly (`z.readonly`)
  - Default values (`z.default`)
  - Catch values (`z.catch`)
  - Prefault values (`z.prefault`)
  - NonOptional (`z.nonoptional`)
  - Transforms/Pipes (`z.pipe`, `.transform()`)
  - All primitive types (string, number, boolean, date, etc.)
- **Zero Dependencies:** Relies only on `zod` as a peer dependency.

## Installation

Install the package using your favorite package manager:

### npm

```bash
npm install zod-deep-partial
```

### yarn

```bash
yarn add zod-deep-partial
```

### pnpm

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
  email: z.email(),
  profile: z.object({
    bio: z.string(),
    avatar: z.url(),
  }),
  tags: z.array(z.string()),
});

// 2. Create the deep partial schema
const partialUserSchema = zodDeepPartial(userSchema);

// 3. Use the partial schema for validation

// All of these are now valid:
partialUserSchema.parse({});
partialUserSchema.parse({ name: "John Doe" });
partialUserSchema.parse({ profile: {} });
partialUserSchema.parse({ profile: { bio: "A developer" } });
partialUserSchema.parse({ tags: ["developer"] });

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

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on the [GitHub repository](https://github.com/amirfarzamnia/zod-deep-partial).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
