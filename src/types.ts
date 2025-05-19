import {
  ZodTypeAny,
  ZodObject,
  ZodArray,
  ZodUnion,
  ZodIntersection,
  ZodRecord,
  ZodTuple,
  ZodLazy,
} from "zod";

export type DeepPartial<T extends ZodTypeAny> = T extends ZodObject<infer Shape>
  ? ZodObject<{ [k in keyof Shape]: DeepPartial<Shape[k]> }>
  : T extends ZodArray<infer Type>
  ? ZodArray<DeepPartial<Type>>
  : T extends ZodUnion<infer Options>
  ? ZodUnion<{ [k in keyof Options]: DeepPartial<Options[k]> }>
  : T extends ZodIntersection<infer Left, infer Right>
  ? ZodIntersection<DeepPartial<Left>, DeepPartial<Right>>
  : T extends ZodRecord<infer Key, infer Value>
  ? ZodRecord<Key, DeepPartial<Value>>
  : T extends ZodTuple<infer Items>
  ? ZodTuple<{ [k in keyof Items]: DeepPartial<Items[k]> }>
  : T extends ZodLazy<infer Type>
  ? ZodLazy<DeepPartial<Type>>
  : T;
