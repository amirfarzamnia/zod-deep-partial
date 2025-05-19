import { z } from "zod";
import { deepPartial } from "../src";

describe("deepPartial", () => {
  it("should make top-level properties optional", () => {
    const schema = z.object({ name: z.string() });
    const partialSchema = deepPartial(schema);
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
    const partialSchema = deepPartial(schema);
    expect(() => partialSchema.parse({})).not.toThrow();
    expect(() => partialSchema.parse({ user: {} })).not.toThrow();
    expect(() => partialSchema.parse({ user: { name: "test" } })).not.toThrow();
  });

  it("should handle arrays", () => {
    const schema = z.object({
      items: z.array(z.object({ value: z.string() })),
    });
    const partialSchema = deepPartial(schema);
    expect(() => partialSchema.parse({})).not.toThrow();
    expect(() => partialSchema.parse({ items: [] })).not.toThrow();
    expect(() => partialSchema.parse({ items: [{}] })).not.toThrow();
    expect(() =>
      partialSchema.parse({ items: [{ value: "test" }] })
    ).not.toThrow();
  });

  // Add more test cases for other Zod types...
});
