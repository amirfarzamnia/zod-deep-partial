import { z } from "zod";
import type { DeepPartial } from "./types";

/**
 * Recursively makes all properties in a Zod schema optional
 * @param schema The Zod schema to make deeply partial
 * @returns A new Zod schema where all properties are optional at all levels
 */
export function deepPartial<T extends z.ZodTypeAny>(schema: T): DeepPartial<T> {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const newShape: Record<string, any> = {};

    for (const key in shape) {
      newShape[key] = deepPartial(shape[key]).optional();
    }

    return z.object(newShape).partial() as any;
  } else if (schema instanceof z.ZodArray) {
    return z.array(deepPartial(schema.element)).optional() as any;
  } else if (schema instanceof z.ZodUnion) {
    return z.union(schema.options.map(deepPartial)).optional() as any;
  } else if (schema instanceof z.ZodIntersection) {
    return z
      .intersection(
        deepPartial(schema._def.left),
        deepPartial(schema._def.right)
      )
      .optional() as any;
  } else if (schema instanceof z.ZodRecord) {
    return z.record(deepPartial(schema.valueSchema)).optional() as any;
  } else if (schema instanceof z.ZodTuple) {
    return z.tuple(schema.items.map(deepPartial) as any).optional() as any;
  } else if (schema instanceof z.ZodLazy) {
    return z.lazy(() => deepPartial(schema._def.getter())).optional() as any;
  } else if (schema instanceof z.ZodDiscriminatedUnion) {
    // For discriminated unions, we need to keep the discriminator field required
    // but make all other fields optional
    const options = schema.options.map((option: any) => {
      if (option instanceof z.ZodObject) {
        const shape = option.shape;
        const newShape: Record<string, any> = {};

        for (const key in shape) {
          // Keep the discriminator field required
          if (key === schema.discriminator) {
            newShape[key] = shape[key];
          } else {
            newShape[key] = deepPartial(shape[key]).optional();
          }
        }

        return z.object(newShape);
      }
      return deepPartial(option);
    });

    return z.discriminatedUnion(schema.discriminator, options) as any;
  } else {
    return schema.optional() as any;
  }
}

export default deepPartial;
