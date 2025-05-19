# zod-deep-partial

Create deeply partial Zod schemas with full TypeScript support.

## Installation

```bash
npm install zod-deep-partial zod
```

## Usage

```typescript
import { z } from "zod";
import { deepPartial } from "zod-deep-partial";

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  tags: z.array(z.string()),
});

const partialUserSchema = deepPartial(userSchema);

// Now all properties are optional at all levels
partialUserSchema.parse({
  name: "John", // optional
  address: {
    // optional
    city: "New York", // optional
    // coordinates is optional and can be omitted
  },
  // age is optional
  // tags is optional
});
```

## Features

- Recursively makes all properties optional
- Preserves TypeScript type safety
- Handles all Zod schema types (objects, arrays, unions, etc.)
- Zero dependencies (peer dependency on Zod)

## License

MIT
