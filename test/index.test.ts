import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zodDeepPartial } from "../src"; // Assuming 'zodDeepPartial' is the correct export

describe("zodDeepPartial", () => {
  // --- Basic Object Tests ---

  it("should make top-level properties optional and handle valid input", () => {
    const schema = z.object({ name: z.string(), id: z.number() });
    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object
    expect(() => partialSchema.parse({})).not.toThrow();
    // ✅ Valid: One property
    expect(() => partialSchema.parse({ name: "test" })).not.toThrow();
    // ✅ Valid: All properties
    expect(() => partialSchema.parse({ name: "test", id: 101 })).not.toThrow();
  });

  it("should fail validation for incorrect types in top-level properties", () => {
    const schema = z.object({ name: z.string() });
    const partialSchema = zodDeepPartial(schema);

    // ❌ Invalid: Wrong type
    expect(() => partialSchema.parse({ name: 123 })).toThrow();
    // ❌ Invalid: Extra property not defined in schema
    expect(() =>
      partialSchema.parse({ name: "test", extra: "field" }),
    ).toThrow();
  });

  // --- Nested Object Tests ---

  it("should make nested properties optional and allow partial nested data", () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        age: z.number(),
        metadata: z.object({
          isActive: z.boolean(),
        }),
      }),
    });
    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Top level missing
    expect(() => partialSchema.parse({})).not.toThrow();
    // ✅ Valid: Nested object is present but empty
    expect(() => partialSchema.parse({ user: {} })).not.toThrow();
    // ✅ Valid: Deeply nested object is present but empty
    expect(() => partialSchema.parse({ user: { metadata: {} } })).not.toThrow();
    // ✅ Valid: Partial nested data
    expect(() => partialSchema.parse({ user: { name: "test" } })).not.toThrow();
    // ✅ Valid: Full nested data
    expect(() =>
      partialSchema.parse({
        user: { name: "test", age: 30, metadata: { isActive: true } },
      }),
    ).not.toThrow();
  });

  it("should fail validation for incorrect types in deeply nested properties", () => {
    const schema = z.object({
      user: z.object({
        metadata: z.object({
          isActive: z.boolean(),
        }),
      }),
    });
    const partialSchema = zodDeepPartial(schema);

    // ❌ Invalid: Wrong type deeply nested
    expect(() =>
      partialSchema.parse({ user: { metadata: { isActive: "true" } } }),
    ).toThrow();
  });

  // --- Array, Map, and Record Tests ---

  it("should handle arrays of objects and allow partial objects within the array", () => {
    const itemSchema = z.object({ value: z.string(), count: z.number() });
    const schema = z.object({ items: z.array(itemSchema) });
    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Top level missing
    expect(() => partialSchema.parse({})).not.toThrow();
    // ✅ Valid: Array present but empty
    expect(() => partialSchema.parse({ items: [] })).not.toThrow();
    // ✅ Valid: Array contains partial objects
    expect(() => partialSchema.parse({ items: [{}] })).not.toThrow();
    expect(() =>
      partialSchema.parse({ items: [{ value: "test" }, {}] }),
    ).not.toThrow();
    // ✅ Valid: Array contains full objects
    expect(() =>
      partialSchema.parse({ items: [{ value: "test", count: 1 }] }),
    ).not.toThrow();

    // ❌ Invalid: Array item has wrong type
    expect(() => partialSchema.parse({ items: [{ value: 123 }] })).toThrow();
    // ❌ Invalid: Array itself is wrong type
    expect(() => partialSchema.parse({ items: "not_an_array" })).toThrow();
  });

  it("should handle records and deep partial their value schema", () => {
    const valueSchema = z.object({ id: z.number(), name: z.string() });
    const schema = z.record(z.string(), valueSchema);
    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty record
    expect(() => partialSchema.parse({})).not.toThrow();
    // ✅ Valid: Record with full value
    expect(() =>
      partialSchema.parse({ key1: { id: 1, name: "A" } }),
    ).not.toThrow();
    // ✅ Valid: Record with partial value
    expect(() => partialSchema.parse({ key2: { id: 2 } })).not.toThrow();
    expect(() => partialSchema.parse({ key3: {} })).not.toThrow();

    // ❌ Invalid: Record value has wrong type
    expect(() => partialSchema.parse({ key4: { id: "1" } })).toThrow();
  });

  it("should handle maps and deep partial their value schema", () => {
    const valueSchema = z.object({ data: z.string() });
    const schema = z.map(z.number(), valueSchema);
    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty map
    expect(() => partialSchema.parse(new Map())).not.toThrow();
    // ✅ Valid: Map with full value
    expect(() =>
      partialSchema.parse(new Map([[1, { data: "test" }]])),
    ).not.toThrow();
    // ✅ Valid: Map with partial value (empty object)
    expect(() => partialSchema.parse(new Map([[2, {}]]))).not.toThrow();

    // ❌ Invalid: Map value has wrong type
    expect(() => partialSchema.parse(new Map([[3, { data: 123 }]]))).toThrow();
  });

  // --- Zod Modifiers and Utilities Tests ---

  it("should respect z.optional(), z.nullable(), and z.default() on the inner type", () => {
    const schema = z.object({
      optionalProp: z.string().optional(),
      nullableProp: z.string().nullable(),
      defaultProp: z.string().default("default"),
      nested: z.object({
        nestedOptional: z.number().optional(),
      }),
    });
    const partialSchema = zodDeepPartial(schema);

    // Test with partial data (all top-level props should now be optional-optional)
    expect(() => partialSchema.parse({})).not.toThrow();

    // Test explicit undefined for partial
    expect(() =>
      partialSchema.parse({ optionalProp: undefined }),
    ).not.toThrow();

    // Test inner nullable/default behavior
    expect(() => partialSchema.parse({ nullableProp: null })).not.toThrow();
    expect(() => partialSchema.parse({ defaultProp: undefined })).not.toThrow(); // Should use default

    // Test deeply nested optional is now optional-optional
    expect(() => partialSchema.parse({ nested: {} })).not.toThrow();
    expect(() =>
      partialSchema.parse({ nested: { nestedOptional: undefined } }),
    ).not.toThrow();
  });

  it("should handle tuples correctly (deep-partial tuple elements)", () => {
    const schema = z.tuple([z.string(), z.number()]);
    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Missing (top-level optional)
    expect(() => partialSchema.parse(undefined)).not.toThrow();

    // ✅ Valid: Full tuple
    expect(() => partialSchema.parse(["test", 123])).not.toThrow();

    // ✅ Valid: Partial tuple (elements are optional)
    expect(() => partialSchema.parse(["test"])).not.toThrow();

    // ❌ Invalid: Wrong type
    expect(() => partialSchema.parse([123])).toThrow();
  });

  // --- Complex Type Tests ---

  it("should handle unions (making the union itself optional)", () => {
    const schema = z.union([
      z.string(),
      z.number(),
      z.object({ id: z.number() }),
    ]);
    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Missing (top-level optional)
    expect(() => partialSchema.parse(undefined)).not.toThrow();
    // ✅ Valid: String
    expect(() => partialSchema.parse("test")).not.toThrow();
    // ✅ Valid: Number
    expect(() => partialSchema.parse(123)).not.toThrow();
    // ✅ Valid: Partial object (deep partial applied to the object member)
    expect(() => partialSchema.parse({})).not.toThrow();

    // ❌ Invalid: Object with wrong type
    expect(() => partialSchema.parse({ id: "123" })).toThrow();
  });

  it("should handle intersections by deep partialing both sides", () => {
    const schema = z.intersection(
      z.object({ propA: z.string(), nestedA: z.object({ a: z.number() }) }),
      z.object({ propB: z.boolean(), nestedB: z.object({ b: z.string() }) }),
    );
    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Missing all properties (deep partial)
    expect(() => partialSchema.parse({})).not.toThrow();
    // ✅ Valid: Partial mix
    expect(() =>
      partialSchema.parse({ propA: "str", nestedB: { b: "test" } }),
    ).not.toThrow();
    // ✅ Valid: Deeply partial mix
    expect(() => partialSchema.parse({ nestedA: {} })).not.toThrow();
    // ✅ Valid: Full
    expect(() =>
      partialSchema.parse({
        propA: "str",
        nestedA: { a: 1 },
        propB: true,
        nestedB: { b: "test" },
      }),
    ).not.toThrow();

    // ❌ Invalid: Wrong type
    expect(() => partialSchema.parse({ propA: 123 })).toThrow();
  });

  it("should handle discriminated unions by making the non-discriminator fields optional", () => {
    const schema = z.discriminatedUnion("type", [
      z.object({ type: z.literal("A"), a: z.string(), common: z.number() }),
      z.object({ type: z.literal("B"), b: z.number(), common: z.number() }),
    ]);

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Only discriminator present
    expect(() => partialSchema.parse({ type: "A" })).not.toThrow();
    expect(() => partialSchema.parse({ type: "B" })).not.toThrow();

    // ✅ Valid: Discriminator and partial fields
    expect(() => partialSchema.parse({ type: "A", common: 10 })).not.toThrow();

    // ❌ Invalid: Wrong type in a partial field
    expect(() => partialSchema.parse({ type: "B", b: "123" })).toThrow();
  });

  it("should handle recursive types by applying deep partial recursively", () => {
    type TreeNode = {
      value: string;
      children: TreeNode[];
    };

    const treeSchema: z.ZodType<TreeNode> = z.lazy(() =>
      z.object({
        value: z.string(),
        children: z.array(treeSchema),
      }),
    );

    const partialSchema = zodDeepPartial(treeSchema);

    const fullValidTree = {
      value: "root",
      children: [
        {
          value: "child1",
          children: [],
        },
      ],
    };

    // ✅ Valid: Full recursive structure
    expect(() => partialSchema.parse(fullValidTree)).not.toThrow();

    // ✅ Valid: Missing top-level fields
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: Partial inner node (children missing, value present)
    expect(() => partialSchema.parse({ value: "root" })).not.toThrow();

    // ✅ Valid: Array contains partial objects
    expect(() =>
      partialSchema.parse({
        value: "root",
        children: [{}], // Empty object is valid because its fields are optional
      }),
    ).not.toThrow();

    // ❌ Invalid: Incorrect type in a nested field
    expect(() =>
      partialSchema.parse({
        value: "root",
        children: [{ value: 123 }],
      }),
    ).toThrow();
  });

  // --- Primitive Types and Utilities Tests ---

  it("should handle non-object primitives by making the parent property optional", () => {
    const schema = z.object({
      str: z.string(),
      num: z.number(),
      bool: z.boolean(),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: All properties missing
    expect(() => partialSchema.parse({})).not.toThrow();
    // ✅ Valid: Single primitive present
    expect(() => partialSchema.parse({ str: "test" })).not.toThrow();
    // ❌ Invalid: Wrong primitive type
    expect(() => partialSchema.parse({ str: 123 })).toThrow();
  });

  it("should handle literal and enum types", () => {
    const schema = z.object({
      status: z.literal("active"),
      role: z.enum(["admin", "user"]),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Missing
    expect(() => partialSchema.parse({})).not.toThrow();
    // ✅ Valid: Correct literal/enum value
    expect(() =>
      partialSchema.parse({ status: "active", role: "admin" }),
    ).not.toThrow();
    // ❌ Invalid: Incorrect literal/enum value
    expect(() => partialSchema.parse({ status: "inactive" })).toThrow();
  });
});
