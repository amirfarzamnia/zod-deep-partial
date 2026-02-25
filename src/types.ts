import {
  z,
  ZodObject,
  ZodArray,
  ZodUnion,
  ZodIntersection,
  ZodRecord,
  ZodTuple,
  ZodLazy,
  ZodOptional,
  ZodNullable,
  ZodDefault,
  ZodMap,
  ZodSet,
  ZodPromise,
  ZodReadonly,
  ZodCatch,
  ZodPipe,
  ZodNonOptional,
  ZodPrefault,
} from "zod";

/**
 * A type utility that recursively makes all properties in a Zod schema optional.
 *
 * This type is the TypeScript counterpart to the `zodDeepPartial` function. It provides
 * proper type inference for deeply partial schemas, ensuring that:
 *
 * 1. All object properties become optional at all nesting levels
 * 2. Array element types are recursively made partial
 * 3. Union and intersection types are properly handled
 * 4. Record value types are made partial
 * 5. Tuple element types are made partial
 * 6. Lazy/recursive schemas maintain their recursive structure
 * 7. Optional and nullable wrappers are preserved
 * 8. Default values are preserved
 * 9. Map value types are made partial
 * 10. Set element types are made partial
 * 11. Promise inner types are made partial
 * 12. Readonly wrappers are preserved
 * 13. Catch wrappers are preserved
 * 14. Pipe schemas are preserved as-is (transforms have specific input requirements)
 * 15. NonOptional wrappers are preserved
 * 16. Prefault wrappers are preserved
 *
 * The type handles all Zod schema variants through a series of conditional type checks,
 * ensuring complete type safety when working with deeply partial schemas.
 *
 * @template T - The Zod schema type to make deeply partial
 *
 * @example
 * ```typescript
 * import { z } from "zod";
 * import type { DeepPartial } from "zod-deep-partial";
 *
 * const schema = z.object({
 *   name: z.string(),
 *   profile: z.object({
 *     bio: z.string(),
 *     age: z.number(),
 *   }),
 * });
 *
 * type PartialSchema = DeepPartial<typeof schema>;
 * // Results in a type where all properties are optional at all levels
 * ```
 */
export type DeepPartial<T extends z.core.SomeType> =
  // Optional: Preserve optional wrapper and apply DeepPartial to inner type
  T extends ZodOptional<infer Inner>
    ? ZodOptional<DeepPartial<Inner>>
    : // Nullable: Preserve nullable wrapper and apply DeepPartial to inner type
      T extends ZodNullable<infer Inner>
      ? ZodNullable<DeepPartial<Inner>>
      : // Default: Preserve default wrapper and apply DeepPartial to inner type
        T extends ZodDefault<infer Inner>
        ? ZodDefault<DeepPartial<Inner>>
        : // Catch: Preserve catch wrapper and apply DeepPartial to inner type
          T extends ZodCatch<infer Inner>
          ? ZodCatch<DeepPartial<Inner>>
          : // Prefault: Preserve prefault wrapper and apply DeepPartial to inner type
            T extends ZodPrefault<infer Inner>
            ? ZodPrefault<DeepPartial<Inner>>
            : // NonOptional: Preserve nonoptional wrapper and apply DeepPartial to inner type
              T extends ZodNonOptional<infer Inner>
              ? ZodNonOptional<DeepPartial<Inner>>
              : // Readonly: Preserve readonly wrapper and apply DeepPartial to inner type
                T extends ZodReadonly<infer Inner>
                ? ZodReadonly<DeepPartial<Inner>>
                : // Objects: Recursively make all properties in the shape optional
                  T extends ZodObject<infer Shape>
                  ? ZodObject<{
                      [K in keyof Shape]: ZodOptional<DeepPartial<Shape[K]>>;
                    }>
                  : // Arrays: Recursively apply DeepPartial to element type
                    T extends ZodArray<infer Type>
                    ? ZodArray<DeepPartial<Type>>
                    : // Maps: Recursively apply DeepPartial to value type (keys unchanged)
                      T extends ZodMap<infer Key, infer Value>
                      ? ZodMap<Key, DeepPartial<Value>>
                      : // Sets: Recursively apply DeepPartial to element type
                        T extends ZodSet<infer Type>
                        ? ZodSet<DeepPartial<Type>>
                        : // Promises: Recursively apply DeepPartial to inner type
                          T extends ZodPromise<infer Type>
                          ? ZodPromise<DeepPartial<Type>>
                          : // Unions: Recursively apply DeepPartial to each option
                            T extends ZodUnion<infer Options>
                            ? ZodUnion<{
                                [K in keyof Options]: DeepPartial<Options[K]>;
                              }>
                            : // Intersections: Recursively apply DeepPartial to both sides
                              T extends ZodIntersection<infer Left, infer Right>
                              ? ZodIntersection<
                                  DeepPartial<Left>,
                                  DeepPartial<Right>
                                >
                              : // Records: Recursively apply DeepPartial to value type (keys unchanged)
                                T extends ZodRecord<infer Key, infer Value>
                                ? ZodRecord<Key, DeepPartial<Value>>
                                : // Tuples: Recursively apply DeepPartial to each item
                                  T extends ZodTuple<infer Items>
                                  ? ZodTuple<
                                      {
                                        [K in keyof Items]: DeepPartial<
                                          Items[K]
                                        >;
                                      } extends infer U
                                        ? U extends any[]
                                          ? U
                                          : never
                                        : never
                                    >
                                  : // Pipe: Return as-is (transforms have specific input requirements)
                                    T extends ZodPipe<infer In, infer Out>
                                    ? ZodPipe<In, Out>
                                    : // Lazy / recursive: Recursively apply DeepPartial to the lazy type
                                      T extends ZodLazy<infer Type>
                                      ? ZodLazy<DeepPartial<Type>>
                                      : // Fallback: For any other schema type, return as-is
                                        ZodOptional<T>;
