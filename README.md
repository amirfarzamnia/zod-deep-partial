# zod-deep-partial

A TypeScript utility that recursively makes all properties in a Zod schema optional, providing type-safe deep partial schemas.

[![npm version](https://img.shields.io/npm/v/zod-deep-partial.svg)](https://www.npmjs.com/package/zod-deep-partial)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install zod-deep-partial
# or
yarn add zod-deep-partial
# or
pnpm add zod-deep-partial
```

## Features

- Recursively makes all properties in a Zod schema optional
- Preserves type safety with TypeScript
- Handles all Zod schema types:
  - Objects
  - Arrays
  - Unions
  - Intersections
  - Records
  - Tuples
  - Lazy schemas
  - Discriminated unions (preserves discriminator field as required)

## Usage

```typescript
import { z } from "zod";
import { zodDeepPartial } from "zod-deep-partial";

// Define your schema
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    country: z.string(),
  }),
  hobbies: z.array(z.string()),
});

// Create a deep partial version
const partialUserSchema = zodDeepPartial(userSchema);

// Now all fields are optional
const partialUser = partialUserSchema.parse({
  name: "John",
  // age is optional
  address: {
    street: "123 Main St",
    // city and country are optional
  },
  // hobbies is optional
});
```

## API

### `zodDeepPartial<T extends z.ZodTypeAny>(schema: T): DeepPartial<T>`

Recursively makes all properties in a Zod schema optional.

#### Parameters

- `schema`: A Zod schema to make deeply partial

#### Returns

A new Zod schema where all properties are optional at all levels

## Type Support

The package includes full TypeScript support with proper type inference. The `DeepPartial` type utility handles all Zod schema types:

- `ZodObject`
- `ZodArray`
- `ZodUnion`
- `ZodIntersection`
- `ZodRecord`
- `ZodTuple`
- `ZodLazy`
- `ZodDiscriminatedUnion`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Amir Farzamnia](https://github.com/amirfarzamnia)
