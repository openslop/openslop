import { describe, expect, it } from "vitest";
import { Element } from "slate";
import { makeNodeId, assignIdRecursively, stripIds } from "../utils/nodeUtils";

describe("makeNodeId", () => {
  it("returns a 16-character string", () => {
    expect(makeNodeId()).toHaveLength(16);
  });

  it("produces unique IDs on successive calls", () => {
    const ids = new Set(Array.from({ length: 100 }, makeNodeId));
    expect(ids.size).toBe(100);
  });
});

describe("assignIdRecursively", () => {
  it("assigns an ID to an element without one", () => {
    const node = {
      type: "narration" as const,
      children: [{ type: "narration" as const, text: "hi", id: "t1" }],
    } as Element;

    assignIdRecursively(node);
    expect(node.id).toBeDefined();
    expect(node.id).toHaveLength(16);
  });

  it("preserves an existing ID", () => {
    const node = {
      id: "existing-id",
      type: "narration" as const,
      children: [{ type: "narration" as const, text: "hi", id: "t1" }],
    } as Element;

    assignIdRecursively(node);
    expect(node.id).toBe("existing-id");
  });

  it("recurses into nested children", () => {
    const child = {
      type: "character" as const,
      children: [{ type: "character" as const, text: "inner", id: "t1" }],
    } as Element;
    const parent = {
      type: "narration" as const,
      children: [child],
    } as unknown as Element;

    assignIdRecursively(parent);
    expect(parent.id).toBeDefined();
    expect(child.id).toBeDefined();
  });

  it("skips text nodes", () => {
    const textNode = { text: "hello", type: "narration" as const, id: "t1" };
    assignIdRecursively(textNode);
    // text nodes are not Elements, so no id is assigned beyond what exists
    expect(textNode.id).toBe("t1");
  });
});

describe("stripIds", () => {
  it("removes id from an element", () => {
    const node = {
      id: "abc",
      type: "narration" as const,
      children: [{ type: "narration" as const, text: "hi", id: "t1" }],
    } as Element;

    const stripped = stripIds(node) as Element;
    expect(stripped.id).toBeUndefined();
  });

  it("recurses into element children", () => {
    const child = {
      id: "child-el",
      type: "character" as const,
      children: [{ type: "character" as const, text: "inner", id: "t1" }],
    } as Element;
    const node = {
      id: "parent",
      type: "narration" as const,
      children: [child],
    } as unknown as Element;

    const stripped = stripIds(node) as Element;
    expect(stripped.id).toBeUndefined();
    expect((stripped.children[0] as unknown as Element).id).toBeUndefined();
  });

  it("clones text node children preserving their properties", () => {
    const node = {
      id: "parent",
      type: "narration" as const,
      children: [{ type: "narration" as const, text: "hi", id: "t1" }],
    } as Element;

    const stripped = stripIds(node) as Element;
    const textChild = stripped.children[0] as Record<string, unknown>;
    // Text nodes are shallow-cloned, not stripped
    expect(textChild.text).toBe("hi");
    expect(textChild.id).toBe("t1");
  });

  it("preserves other properties", () => {
    const node = {
      id: "abc",
      type: "image" as const,
      customAttributes: { src: "url" },
      children: [{ type: "image" as const, text: "", id: "t1" }],
    } as Element;

    const stripped = stripIds(node) as Element;
    expect(stripped.type).toBe("image");
    expect(stripped.customAttributes).toEqual({ src: "url" });
  });

  it("returns a shallow clone for text nodes", () => {
    const textNode = { text: "hello", type: "narration" as const, id: "t1" };
    const result = stripIds(textNode);
    expect(result).toEqual(textNode);
    expect(result).not.toBe(textNode);
  });
});
