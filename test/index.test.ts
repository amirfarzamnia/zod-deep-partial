import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zodDeepPartial } from "../src";

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

  // --- Array, Map, Set, and Record Tests ---

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

  it("should handle sets and deep partial their element schema", () => {
    const elementSchema = z.object({ id: z.number(), name: z.string() });
    const schema = z.object({ items: z.set(elementSchema) });
    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object
    expect(() => partialSchema.parse({})).not.toThrow();
    // ✅ Valid: Empty set
    expect(() => partialSchema.parse({ items: new Set() })).not.toThrow();
    // ✅ Valid: Set with partial elements
    expect(() =>
      partialSchema.parse({ items: new Set([{ id: 1 }]) }),
    ).not.toThrow();
    expect(() =>
      partialSchema.parse({ items: new Set([{ name: "test" }]) }),
    ).not.toThrow();
    // ✅ Valid: Set with full elements
    expect(() =>
      partialSchema.parse({ items: new Set([{ id: 1, name: "test" }]) }),
    ).not.toThrow();

    // ❌ Invalid: Set element has wrong type
    expect(() =>
      partialSchema.parse({ items: new Set([{ id: "1" }]) }),
    ).toThrow();
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

  // --- ZodOptional & ZodNullable Specific Tests ---

  it("should preserve nullable semantics while deep-partialing", () => {
    const schema = z.object({
      name: z.string().nullable(),
      nested: z.object({
        value: z.number().nullable(),
      }),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Missing fields
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: Nullable fields explicitly set to null
    expect(() => partialSchema.parse({ name: null })).not.toThrow();
    expect(() =>
      partialSchema.parse({ nested: { value: null } }),
    ).not.toThrow();

    // ❌ Invalid: Wrong type (still enforced)
    expect(() => partialSchema.parse({ name: 123 })).toThrow();
    expect(() => partialSchema.parse({ nested: { value: "123" } })).toThrow();
  });

  it("should preserve optional semantics while deep-partialing", () => {
    const schema = z.object({
      title: z.string().optional(),
      nested: z.object({
        count: z.number().optional(),
      }),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Missing everything
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: Explicit undefined
    expect(() => partialSchema.parse({ title: undefined })).not.toThrow();

    // ✅ Valid: Nested optional missing
    expect(() => partialSchema.parse({ nested: {} })).not.toThrow();

    // ❌ Invalid: Wrong type
    expect(() => partialSchema.parse({ title: 123 })).toThrow();
  });

  it("should handle optional + nullable combinations correctly", () => {
    const schema = z.object({
      value: z.string().optional().nullable(),
      nested: z.object({
        inner: z.number().nullable().optional(),
      }),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Missing
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: Explicit null
    expect(() => partialSchema.parse({ value: null })).not.toThrow();
    expect(() =>
      partialSchema.parse({ nested: { inner: null } }),
    ).not.toThrow();

    // ✅ Valid: Explicit undefined
    expect(() => partialSchema.parse({ value: undefined })).not.toThrow();

    // ❌ Invalid: Wrong type
    expect(() => partialSchema.parse({ value: 123 })).toThrow();
    expect(() => partialSchema.parse({ nested: { inner: "123" } })).toThrow();
  });

  it("should deep-partial optional and nullable schemas inside arrays", () => {
    const schema = z.object({
      items: z.array(
        z.object({
          name: z.string().nullable(),
          count: z.number().optional(),
        }),
      ),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Missing
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: Array with empty object
    expect(() => partialSchema.parse({ items: [{}] })).not.toThrow();

    // ✅ Valid: Nullable inside array
    expect(() =>
      partialSchema.parse({ items: [{ name: null }] }),
    ).not.toThrow();

    // ❌ Invalid: Wrong type inside array
    expect(() => partialSchema.parse({ items: [{ count: "1" }] })).toThrow();
  });

  // --- ZodDefault Tests ---

  it("should preserve default values while deep-partialing", () => {
    const schema = z.object({
      name: z.string().default("default-name"),
      nested: z.object({
        value: z.number().default(42),
      }),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object (defaults should apply)
    expect(() => partialSchema.parse({})).not.toThrow();
    const result1 = partialSchema.parse({});
    expect(result1.name).toBe("default-name");

    // ✅ Valid: Nested empty object
    expect(() => partialSchema.parse({ nested: {} })).not.toThrow();
    const result2 = partialSchema.parse({ nested: {} });
    expect(result2.nested?.value).toBe(42);

    // ✅ Valid: Override defaults
    expect(() => partialSchema.parse({ name: "custom" })).not.toThrow();
    const result3 = partialSchema.parse({ name: "custom" });
    expect(result3.name).toBe("custom");
  });

  // --- ZodReadonly Tests ---

  it("should preserve readonly wrapper while deep-partialing", () => {
    const schema = z.object({
      config: z.object({ name: z.string(), value: z.number() }).readonly(),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: Partial config
    expect(() =>
      partialSchema.parse({ config: { name: "test" } }),
    ).not.toThrow();
    expect(() => partialSchema.parse({ config: {} })).not.toThrow();

    // ✅ Valid: Full config
    expect(() =>
      partialSchema.parse({ config: { name: "test", value: 123 } }),
    ).not.toThrow();

    // ❌ Invalid: Wrong type
    expect(() => partialSchema.parse({ config: { name: 123 } })).toThrow();
  });

  // --- ZodCatch Tests ---

  it("should preserve catch wrapper while deep-partialing", () => {
    const schema = z.object({
      data: z.object({ name: z.string() }).catch({ name: "fallback" }),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: Partial data (catch should handle invalid inner data)
    expect(() => partialSchema.parse({ data: {} })).not.toThrow();
  });

  // --- ZodPrefault Tests ---

  it("should preserve prefault wrapper while deep-partialing", () => {
    const schema = z.object({
      data: z.object({ name: z.string() }).prefault({ name: "prefault-name" }),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: Partial data
    expect(() => partialSchema.parse({ data: {} })).not.toThrow();
  });

  // --- ZodNonOptional Tests ---

  it("should preserve nonoptional wrapper while deep-partialing", () => {
    const schema = z.object({
      value: z.string().optional().nonoptional(),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object (the property itself becomes optional at object level)
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: With value
    expect(() => partialSchema.parse({ value: "test" })).not.toThrow();

    // ❌ Invalid: Wrong type
    expect(() => partialSchema.parse({ value: 123 })).toThrow();
  });

  // --- ZodPipe (Transform) Tests ---

  it("should handle pipe/transform schemas by preserving them as-is", () => {
    const schema = z.object({
      value: z.string().transform((s) => s.length),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object (the property is optional at object level)
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: With value (transform should still work)
    expect(() => partialSchema.parse({ value: "hello" })).not.toThrow();
    const result = partialSchema.parse({ value: "hello" });
    expect(result.value).toBe(5);

    // ❌ Invalid: Wrong input type
    expect(() => partialSchema.parse({ value: 123 })).toThrow();
  });

  // --- ZodPromise Tests ---

  it("should handle promise schemas by deep-partialing inner type", async () => {
    const schema = z.object({
      data: z.promise(z.object({ name: z.string(), age: z.number() })),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: Promise with partial data
    const promise = Promise.resolve({ name: "test" });
    const result = await partialSchema.parseAsync({ data: promise });
    // result.data is a Promise, so we need to await it
    const innerData = await result.data;
    expect(innerData?.name).toBe("test");
  });

  // --- ZodDate Tests ---

  it("should handle date schemas", () => {
    const schema = z.object({
      createdAt: z.date(),
      updatedAt: z.date().optional(),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: With date
    const date = new Date();
    expect(() => partialSchema.parse({ createdAt: date })).not.toThrow();

    // ❌ Invalid: Wrong type
    expect(() => partialSchema.parse({ createdAt: "2024-01-01" })).toThrow();
  });

  // --- ZodFile Tests ---

  it("should handle file schemas", () => {
    const schema = z.object({
      file: z.file(),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object
    expect(() => partialSchema.parse({})).not.toThrow();
  });

  // --- ZodTemplateLiteral Tests ---

  it("should handle template literal schemas", () => {
    const schema = z.object({
      path: z.templateLiteral(["users", "/", z.number()]),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: With correct template literal value
    expect(() => partialSchema.parse({ path: "users/123" })).not.toThrow();
  });

  // --- ZodNaN Tests ---

  it("should handle NaN schemas", () => {
    const schema = z.object({
      value: z.nan(),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: With NaN
    expect(() => partialSchema.parse({ value: NaN })).not.toThrow();

    // ❌ Invalid: Non-NaN value
    expect(() => partialSchema.parse({ value: 123 })).toThrow();
  });

  // --- ZodAny, ZodUnknown Tests ---

  it("should handle any and unknown schemas", () => {
    const schema = z.object({
      anyValue: z.any(),
      unknownValue: z.unknown(),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: With any value
    expect(() => partialSchema.parse({ anyValue: "anything" })).not.toThrow();
    expect(() => partialSchema.parse({ anyValue: 123 })).not.toThrow();

    // ✅ Valid: With unknown value
    expect(() =>
      partialSchema.parse({ unknownValue: "something" }),
    ).not.toThrow();
  });

  // --- ZodNever Tests ---

  it("should handle never schemas", () => {
    const schema = z.object({
      neverValue: z.never(),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object (never field is optional)
    expect(() => partialSchema.parse({})).not.toThrow();

    // ❌ Invalid: Providing a value to never field
    expect(() => partialSchema.parse({ neverValue: "test" })).toThrow();
  });

  // --- ZodVoid Tests ---

  it("should handle void schemas", () => {
    const schema = z.object({
      voidValue: z.void(),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: With undefined (void accepts undefined)
    expect(() => partialSchema.parse({ voidValue: undefined })).not.toThrow();
  });

  // --- ZodSymbol Tests ---

  it("should handle symbol schemas", () => {
    const schema = z.object({
      sym: z.symbol(),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: With symbol
    expect(() => partialSchema.parse({ sym: Symbol("test") })).not.toThrow();

    // ❌ Invalid: Wrong type
    expect(() => partialSchema.parse({ sym: "not-a-symbol" })).toThrow();
  });

  // --- ZodUndefined Tests ---

  it("should handle undefined schemas", () => {
    const schema = z.object({
      undefinedValue: z.undefined(),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: With explicit undefined
    expect(() =>
      partialSchema.parse({ undefinedValue: undefined }),
    ).not.toThrow();

    // ❌ Invalid: With non-undefined value
    expect(() => partialSchema.parse({ undefinedValue: "test" })).toThrow();
  });

  // --- ZodNull Tests ---

  it("should handle null schemas", () => {
    const schema = z.object({
      nullValue: z.null(),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: With null
    expect(() => partialSchema.parse({ nullValue: null })).not.toThrow();

    // ❌ Invalid: With non-null value
    expect(() => partialSchema.parse({ nullValue: "test" })).toThrow();
  });

  // --- ZodFunction Tests ---

  it("should handle function schemas", () => {
    const schema = z.object({
      handler: z.function(),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: With function
    expect(() => partialSchema.parse({ handler: () => {} })).not.toThrow();

    // ❌ Invalid: With non-function value
    expect(() => partialSchema.parse({ handler: "not-a-function" })).toThrow();
  });

  // --- Complex Nested Scenarios ---

  it("should handle deeply nested combinations of types", () => {
    const schema = z.object({
      users: z.array(
        z.object({
          profile: z.object({
            name: z.string(),
            contacts: z.array(
              z.object({
                type: z.enum(["email", "phone"]),
                value: z.string(),
                metadata: z
                  .object({
                    verified: z.boolean(),
                    createdAt: z.date(),
                  })
                  .optional(),
              }),
            ),
          }),
          settings: z.record(
            z.string(),
            z.object({
              enabled: z.boolean(),
              config: z
                .object({
                  value: z.number(),
                })
                .nullable(),
            }),
          ),
        }),
      ),
    });

    const partialSchema = zodDeepPartial(schema);

    // ✅ Valid: Empty object
    expect(() => partialSchema.parse({})).not.toThrow();

    // ✅ Valid: Partial users array
    expect(() => partialSchema.parse({ users: [] })).not.toThrow();
    expect(() => partialSchema.parse({ users: [{}] })).not.toThrow();

    // ✅ Valid: Partial profile
    expect(() =>
      partialSchema.parse({ users: [{ profile: {} }] }),
    ).not.toThrow();
    expect(() =>
      partialSchema.parse({ users: [{ profile: { name: "test" } }] }),
    ).not.toThrow();

    // ✅ Valid: Partial contacts
    expect(() =>
      partialSchema.parse({
        users: [{ profile: { contacts: [{}] } }],
      }),
    ).not.toThrow();
    expect(() =>
      partialSchema.parse({
        users: [{ profile: { contacts: [{ type: "email" }] } }],
      }),
    ).not.toThrow();

    // ✅ Valid: Partial settings record
    expect(() =>
      partialSchema.parse({ users: [{ settings: {} }] }),
    ).not.toThrow();
    expect(() =>
      partialSchema.parse({ users: [{ settings: { theme: {} } }] }),
    ).not.toThrow();
    expect(() =>
      partialSchema.parse({
        users: [{ settings: { theme: { enabled: true } } }],
      }),
    ).not.toThrow();

    // ❌ Invalid: Wrong type in nested structure
    expect(() =>
      partialSchema.parse({ users: [{ profile: { name: 123 } }] }),
    ).toThrow();
    expect(() =>
      partialSchema.parse({
        users: [{ profile: { contacts: [{ type: "invalid" }] } }],
      }),
    ).toThrow();
  });

  // --- Performance Tests ---

  it("should handle large schemas efficiently", () => {
    // Create a large schema with many nested properties
    const createNestedObject = (depth: number): z.ZodObject<any> => {
      if (depth === 0) {
        return z.object({
          value: z.string(),
          count: z.number(),
        });
      }
      return z.object({
        nested: createNestedObject(depth - 1),
        value: z.string(),
      });
    };

    const largeSchema = createNestedObject(10);
    const partialSchema = zodDeepPartial(largeSchema);

    // ✅ Valid: Should parse quickly even with deep nesting
    const start = performance.now();
    expect(() => partialSchema.parse({})).not.toThrow();
    const duration = performance.now() - start;

    // Should complete in reasonable time (< 100ms for 10 levels)
    expect(duration).toBeLessThan(100);
  });

  // --- Type Inference Tests ---

  it("should provide correct type inference for partial schemas", () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
      nested: z.object({
        value: z.string(),
      }),
    });

    const partialSchema = zodDeepPartial(schema);

    // Type inference test - these should compile without errors
    type PartialType = z.infer<typeof partialSchema>;

    // All properties should be optional
    const validEmpty: PartialType = {};
    const validPartial: PartialType = { name: "test" };
    const validNested: PartialType = { nested: {} };
    const validFull: PartialType = {
      name: "test",
      age: 30,
      nested: { value: "test" },
    };

    expect(validEmpty).toBeDefined();
    expect(validPartial).toBeDefined();
    expect(validNested).toBeDefined();
    expect(validFull).toBeDefined();
  });
});
