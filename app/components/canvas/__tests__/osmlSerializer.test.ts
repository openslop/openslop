import { describe, expect, it } from "vitest";
import { OSMLSerializer } from "../utils/osmlSerializer";
import type { CanvasElement } from "../types";

function el(
  type: CanvasElement["type"],
  text: string,
  customAttributes?: Record<string, string>,
): CanvasElement {
  return {
    id: "e1",
    type,
    ...(customAttributes && { customAttributes }),
    children: [{ id: "t1", type, text }],
  };
}

describe("OSMLSerializer.serialize", () => {
  it("serializes narration as plain text", () => {
    const result = OSMLSerializer.serialize([el("narration", "Hello world")]);
    expect(result).toBe("Hello world");
  });

  it("serializes tagged elements with angle brackets", () => {
    const result = OSMLSerializer.serialize([el("image", "a sunset")]);
    expect(result).toBe("<image>a sunset</image>");
  });

  it("includes attributes in the tag", () => {
    const result = OSMLSerializer.serialize([
      el("character", "Hi there", { name: "Lyra", gender: "female" }),
    ]);
    expect(result).toBe(
      '<character name="Lyra" gender="female">Hi there</character>',
    );
  });

  it("serializes mixed elements", () => {
    const result = OSMLSerializer.serialize([
      el("narration", "Once upon a time"),
      el("character", "Hello!", { name: "Bob" }),
      el("image", "forest"),
    ]);
    expect(result).toBe(
      'Once upon a time\n<character name="Bob">Hello!</character>\n<image>forest</image>',
    );
  });

  it("handles empty attributes", () => {
    const result = OSMLSerializer.serialize([el("music", "epic orchestral")]);
    expect(result).toBe("<music>epic orchestral</music>");
  });
});

describe("OSMLSerializer streaming", () => {
  it("parses a single complete tag", () => {
    const s = new OSMLSerializer();
    s.appendChunk("<image>a sunset</image>");
    const nodes = s.getNodes() as CanvasElement[];

    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe("image");
    expect(nodes[0].children[0].text).toBe("a sunset");
  });

  it("handles streaming chunks across tag boundaries", () => {
    const s = new OSMLSerializer();
    s.appendChunk("<char");
    s.appendChunk('acter name="Al');
    s.appendChunk('ice">Hello');
    s.appendChunk(" world</character>");

    const nodes = s.getNodes() as CanvasElement[];
    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe("character");
    expect(nodes[0].customAttributes?.name).toBe("Alice");
    expect(nodes[0].children[0].text).toBe("Hello world");
  });

  it("flushes plain text after buffer threshold", () => {
    const s = new OSMLSerializer();
    // Need an initial node for text to append to
    s.appendChunk("<narration>");
    s.appendChunk("Some long narration text here");

    const nodes = s.getNodes() as CanvasElement[];
    expect(nodes).toHaveLength(1);
    expect(nodes[0].children[0].text).toBe("Some long narration text here");
  });

  it("defaults unknown tags to narration type", () => {
    const s = new OSMLSerializer();
    s.appendChunk("<unknowntag>content</unknowntag>");

    const nodes = s.getNodes() as CanvasElement[];
    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe("narration");
  });

  it("parses attributes correctly", () => {
    const s = new OSMLSerializer();
    s.appendChunk('<sound effect="thunder" volume="loud">boom</sound>');

    const nodes = s.getNodes() as CanvasElement[];
    expect(nodes).toHaveLength(1);
    expect(nodes[0].customAttributes).toEqual({
      effect: "thunder",
      volume: "loud",
    });
  });
});

describe("OSMLSerializer.getTextContent", () => {
  it("extracts joined text from children", () => {
    const element: CanvasElement = {
      id: "e1",
      type: "narration",
      children: [
        { id: "t1", type: "narration", text: "Hello " },
        { id: "t2", type: "narration", text: "world" },
      ],
    };
    expect(OSMLSerializer.getTextContent(element)).toBe("Hello world");
  });
});
