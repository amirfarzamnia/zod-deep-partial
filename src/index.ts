import { z } from "zod";
import type { DeepPartial } from "./types";

/**
 * Recursively makes all properties in a Zod schema optional
 * @param schema The Zod schema to make deeply partial
 * @returns A new Zod schema where all properties are optional at all levels
 */
function zodDeepPartialInternal<T extends z.core.SomeType>(
  schema: T,
  isTopLevel: boolean = false,
): any {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const newShape: Record<string, any> = {};

    for (const key in shape) {
      newShape[key] = zodDeepPartialInternal(shape[key], false).optional();
    }

    let result = z.object(newShape).partial();

    // Apply strict mode only at top level
    if (isTopLevel) {
      result = result.strict();
    }

    return result;
  } else if (schema instanceof z.ZodArray) {
    return z
      .array(zodDeepPartialInternal(schema.def.element, false))
      .optional();
  } else if (schema instanceof z.ZodMap) {
    return z
      .map(
        zodDeepPartialInternal(schema.def.keyType, false),
        zodDeepPartialInternal(schema.def.valueType, false),
      )
      .optional();
  } else if (schema instanceof z.ZodUnion) {
    return z
      .union(schema.options.map((opt) => zodDeepPartialInternal(opt, false)))
      .optional();
  } else if (schema instanceof z.ZodIntersection) {
    return z
      .intersection(
        zodDeepPartialInternal(schema.def.left, false),
        zodDeepPartialInternal(schema.def.right, false),
      )
      .optional();
  } else if (schema instanceof z.ZodRecord) {
    return z
      .record(
        zodDeepPartialInternal(schema.def.keyType, false),
        zodDeepPartialInternal(schema.def.valueType, false),
      )
      .optional();
  } else if (schema instanceof z.ZodTuple) {
    return z
      .tuple(
        schema.def.items.map((item) =>
          zodDeepPartialInternal(item, false),
        ) as any,
      )
      .optional();
  } else if (schema instanceof z.ZodLazy) {
    return z
      .lazy(() => zodDeepPartialInternal(schema.def.getter(), false))
      .optional();
  } else if (schema instanceof z.ZodDiscriminatedUnion) {
    // For discriminated unions, we need to keep the discriminator field required
    // but make all other fields optional
    const options = schema.options.map((option) => {
      if (option instanceof z.ZodObject) {
        const shape = option.shape;
        const newShape: Record<string, any> = {};

        for (const key in shape) {
          if (key === schema.def.discriminator) {
            // Keep discriminator field required
            newShape[key] = shape[key];
          } else {
            // Make other fields optional
            newShape[key] = zodDeepPartialInternal(
              shape[key],
              false,
            ).optional();
          }
        }

        return z.object(newShape);
      }
      return zodDeepPartialInternal(option, false);
    });

    return z.discriminatedUnion(schema.def.discriminator, options as any);
  } else {
    return (schema as any).optional();
  }
}

export function zodDeepPartial<T extends z.core.SomeType>(
  schema: T,
): DeepPartial<T> {
  return zodDeepPartialInternal(schema, true);
}
