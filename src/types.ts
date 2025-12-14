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
} from "zod";

export type DeepPartial<T extends z.core.SomeType> =
  // Optional
  T extends ZodOptional<infer Inner>
    ? ZodOptional<DeepPartial<Inner>>
    : // Nullable
      T extends ZodNullable<infer Inner>
      ? ZodNullable<DeepPartial<Inner>>
      : // Default
        T extends ZodDefault<infer Inner>
        ? ZodDefault<DeepPartial<Inner>>
        : // Objects
          T extends ZodObject<infer Shape>
          ? ZodObject<{ [K in keyof Shape]: DeepPartial<Shape[K]> }>
          : // Arrays
            T extends ZodArray<infer Type>
            ? ZodArray<DeepPartial<Type>>
            : // Unions
              T extends ZodUnion<infer Options>
              ? ZodUnion<{ [K in keyof Options]: DeepPartial<Options[K]> }>
              : // Intersections
                T extends ZodIntersection<infer Left, infer Right>
                ? ZodIntersection<DeepPartial<Left>, DeepPartial<Right>>
                : // Records
                  T extends ZodRecord<infer Key, infer Value>
                  ? ZodRecord<Key, DeepPartial<Value>>
                  : // Tuples
                    T extends ZodTuple<infer Items>
                    ? ZodTuple<
                        {
                          [K in keyof Items]: DeepPartial<Items[K]>;
                        } extends infer U
                          ? U extends any[]
                            ? U
                            : never
                          : never
                      >
                    : // Lazy / recursive
                      T extends ZodLazy<infer Type>
                      ? ZodLazy<DeepPartial<Type>>
                      : // Fallback
                        T;
