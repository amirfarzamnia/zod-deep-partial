import { z } from "zod";
import { zodDeepPartial } from "../src";

describe("zodDeepPartial", () => {
  it("should make top-level properties optional", () => {
    const schema = z.object({ name: z.string() });
    const partialSchema = zodDeepPartial(schema);
    expect(() => partialSchema.parse({})).not.toThrow();
    expect(() => partialSchema.parse({ name: "test" })).not.toThrow();
  });

  it("should make nested properties optional", () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        age: z.number(),
      }),
    });
    const partialSchema = zodDeepPartial(schema);
    expect(() => partialSchema.parse({})).not.toThrow();
    expect(() => partialSchema.parse({ user: {} })).not.toThrow();
    expect(() => partialSchema.parse({ user: { name: "test" } })).not.toThrow();
  });

  it("should handle arrays", () => {
    const schema = z.object({
      items: z.array(z.object({ value: z.string() })),
    });
    const partialSchema = zodDeepPartial(schema);
    expect(() => partialSchema.parse({})).not.toThrow();
    expect(() => partialSchema.parse({ items: [] })).not.toThrow();
    expect(() => partialSchema.parse({ items: [{}] })).not.toThrow();
    expect(() =>
      partialSchema.parse({ items: [{ value: "test" }] })
    ).not.toThrow();
  });

  it("should handle unions", () => {
    const schema = z.union([z.string(), z.number()]);
    const partialSchema = zodDeepPartial(schema);
    expect(() => partialSchema.parse(undefined)).not.toThrow();
    expect(() => partialSchema.parse("test")).not.toThrow();
    expect(() => partialSchema.parse(123)).not.toThrow();
  });

  it("should handle intersections", () => {
    const schema = z.intersection(
      z.object({ name: z.string() }),
      z.object({ age: z.number() })
    );
    const partialSchema = zodDeepPartial(schema);
    expect(() => partialSchema.parse({})).not.toThrow();
    expect(() => partialSchema.parse({ name: "test" })).not.toThrow();
    expect(() => partialSchema.parse({ age: 123 })).not.toThrow();
  });

  it("should handle records", () => {
    const schema = z.record(z.string());
    const partialSchema = zodDeepPartial(schema);
    expect(() => partialSchema.parse({})).not.toThrow();
    expect(() => partialSchema.parse({ key: "value" })).not.toThrow();
  });

  it("should handle tuples", () => {
    const schema = z.tuple([z.string(), z.number()]);
    const partialSchema = zodDeepPartial(schema);
    expect(() => partialSchema.parse(undefined)).not.toThrow();
    expect(() => partialSchema.parse(["test", 123])).not.toThrow();
  });

  it("should handle lazy types", () => {
    const schema = z.lazy(() => z.object({ name: z.string() }));
    const partialSchema = zodDeepPartial(schema);
    expect(() => partialSchema.parse(undefined)).not.toThrow();
    expect(() => partialSchema.parse({ name: "test" })).not.toThrow();
  });

  it("should handle complex nested structures", () => {
    const schema = z.object({
      user: z.object({
        profile: z.object({
          personal: z.object({
            name: z.string(),
            age: z.number(),
            address: z.object({
              street: z.string(),
              city: z.string(),
              country: z.string(),
            }),
          }),
          preferences: z.object({
            theme: z.string(),
            notifications: z.boolean(),
          }),
        }),
        posts: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
            tags: z.array(z.string()),
            metadata: z.object({
              createdAt: z.date(),
              updatedAt: z.date(),
            }),
          })
        ),
      }),
    });

    const partialSchema = zodDeepPartial(schema);

    // Test various levels of partial data
    expect(() => partialSchema.parse({})).not.toThrow();
    expect(() => partialSchema.parse({ user: {} })).not.toThrow();
    expect(() => partialSchema.parse({ user: { profile: {} } })).not.toThrow();
    expect(() =>
      partialSchema.parse({ user: { profile: { personal: {} } } })
    ).not.toThrow();
    expect(() => partialSchema.parse({ user: { posts: [] } })).not.toThrow();
    expect(() => partialSchema.parse({ user: { posts: [{}] } })).not.toThrow();
  });

  it("should handle primitive types correctly", () => {
    const schema = z.object({
      string: z.string(),
      number: z.number(),
      boolean: z.boolean(),
      date: z.date(),
      bigint: z.bigint(),
      symbol: z.symbol(),
      null: z.null(),
      undefined: z.undefined(),
    });

    const partialSchema = zodDeepPartial(schema);

    // Test each primitive type
    expect(() => partialSchema.parse({ string: "test" })).not.toThrow();
    expect(() => partialSchema.parse({ number: 123 })).not.toThrow();
    expect(() => partialSchema.parse({ boolean: true })).not.toThrow();
    expect(() => partialSchema.parse({ date: new Date() })).not.toThrow();
    expect(() => partialSchema.parse({ bigint: BigInt(123) })).not.toThrow();
    expect(() => partialSchema.parse({ symbol: Symbol() })).not.toThrow();
    expect(() => partialSchema.parse({ null: null })).not.toThrow();
    expect(() => partialSchema.parse({ undefined: undefined })).not.toThrow();
  });

  it("should handle empty arrays and objects", () => {
    const schema = z.object({
      emptyArray: z.array(z.string()),
      emptyObject: z.object({}),
      nestedEmpty: z.object({
        emptyArray: z.array(z.string()),
        emptyObject: z.object({}),
      }),
    });

    const partialSchema = zodDeepPartial(schema);

    expect(() => partialSchema.parse({ emptyArray: [] })).not.toThrow();
    expect(() => partialSchema.parse({ emptyObject: {} })).not.toThrow();
    expect(() =>
      partialSchema.parse({ nestedEmpty: { emptyArray: [], emptyObject: {} } })
    ).not.toThrow();
  });

  it("should handle enums and native enums", () => {
    enum TestEnum {
      A = "A",
      B = "B",
    }

    const schema = z.object({
      enum: z.enum(["A", "B"]),
      nativeEnum: z.nativeEnum(TestEnum),
    });

    const partialSchema = zodDeepPartial(schema);

    expect(() => partialSchema.parse({ enum: "A" })).not.toThrow();
    expect(() => partialSchema.parse({ nativeEnum: TestEnum.A })).not.toThrow();
    expect(() => partialSchema.parse({})).not.toThrow();
  });

  it("should handle discriminated unions", () => {
    const schema = z.discriminatedUnion("type", [
      z.object({
        type: z.literal("A"),
        a: z.string(),
      }),
      z.object({
        type: z.literal("B"),
        b: z.number(),
      }),
    ]);

    const partialSchema = zodDeepPartial(schema);

    expect(() => partialSchema.parse({ type: "A" })).not.toThrow();
    expect(() => partialSchema.parse({ type: "A", a: "test" })).not.toThrow();
    expect(() => partialSchema.parse({ type: "B" })).not.toThrow();
    expect(() => partialSchema.parse({ type: "B", b: 123 })).not.toThrow();
  });

  it("should handle recursive types", () => {
    type TreeNode = {
      value: string;
      children: TreeNode[];
    };

    const treeSchema: z.ZodType<TreeNode> = z.lazy(() =>
      z.object({
        value: z.string(),
        children: z.array(treeSchema),
      })
    );

    const partialSchema = zodDeepPartial(treeSchema);

    const validTree = {
      value: "root",
      children: [
        {
          value: "child1",
          children: [],
        },
      ],
    };

    expect(() => partialSchema.parse(validTree)).not.toThrow();
    expect(() => partialSchema.parse({ value: "root" })).not.toThrow();
    expect(() => partialSchema.parse({ children: [] })).not.toThrow();
  });
});
