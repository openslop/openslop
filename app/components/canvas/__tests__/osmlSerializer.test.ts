import { describe, expect, it } from "vitest";
import { OSMLSerializer } from "../utils/osmlSerializer";
import {
	SCENE_TYPE,
	type CanvasContentElement,
	type SceneElement,
} from "../types";

function el(
	type: CanvasContentElement["type"],
	text: string,
	customAttributes?: Record<string, string>,
): CanvasContentElement {
	return {
		id: "e1",
		type,
		...(customAttributes && { customAttributes }),
		children: [{ id: "t1", type, text }],
	};
}

const wrap = (...children: CanvasContentElement[]): SceneElement => ({
	id: "scene-1",
	type: SCENE_TYPE,
	children,
});

describe("OSMLSerializer.serialize", () => {
	it("serializes narration with id", () => {
		const result = OSMLSerializer.serialize([
			wrap(el("narration", "Hello world")),
		]);
		expect(result).toBe('<narration id="e1">Hello world</narration>');
	});

	it("serializes tagged elements with id", () => {
		const result = OSMLSerializer.serialize([wrap(el("image", "a sunset"))]);
		expect(result).toBe('<image id="e1">a sunset</image>');
	});

	it("includes attributes after id in the tag", () => {
		const result = OSMLSerializer.serialize([
			wrap(el("character", "Hi there", { name: "Lyra", gender: "female" })),
		]);
		expect(result).toBe(
			'<character id="e1" name="Lyra" gender="female">Hi there</character>',
		);
	});

	it("flattens scene hierarchy when serializing", () => {
		const result = OSMLSerializer.serialize([
			wrap(el("narration", "Once upon a time")),
			wrap(el("character", "Hello!", { name: "Bob" }), el("image", "forest")),
		]);
		expect(result).toBe(
			'<narration id="e1">Once upon a time</narration>\n<character id="e1" name="Bob">Hello!</character>\n<image id="e1">forest</image>',
		);
	});

	it("handles empty attributes", () => {
		const result = OSMLSerializer.serialize([
			wrap(el("music", "epic orchestral")),
		]);
		expect(result).toBe('<music id="e1">epic orchestral</music>');
	});
});

describe("OSMLSerializer streaming", () => {
	it("parses a single complete tag", () => {
		const s = new OSMLSerializer();
		s.appendChunk("<image>a sunset</image>");
		const nodes = s.getNodes() as CanvasContentElement[];

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

		const nodes = s.getNodes() as CanvasContentElement[];
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

		const nodes = s.getNodes() as CanvasContentElement[];
		expect(nodes).toHaveLength(1);
		expect(nodes[0].children[0].text).toBe("Some long narration text here");
	});

	it("defaults unknown tags to narration type", () => {
		const s = new OSMLSerializer();
		s.appendChunk("<unknowntag>content</unknowntag>");

		const nodes = s.getNodes() as CanvasContentElement[];
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("narration");
	});

	it("parses attributes correctly", () => {
		const s = new OSMLSerializer();
		s.appendChunk('<sound effect="thunder" volume="loud">boom</sound>');

		const nodes = s.getNodes() as CanvasContentElement[];
		expect(nodes).toHaveLength(1);
		expect(nodes[0].customAttributes).toEqual({
			effect: "thunder",
			volume: "loud",
		});
	});
});

function elWithId(
	type: CanvasContentElement["type"],
	id: string,
	text: string,
	customAttributes?: Record<string, string>,
): CanvasContentElement {
	return {
		id,
		type,
		...(customAttributes && { customAttributes }),
		children: [{ id: `${id}-t`, type, text }],
	};
}

describe("OSMLSerializer.serializeWithScenes", () => {
	it("includes scene headers with numbers", () => {
		const result = OSMLSerializer.serializeWithScenes([
			wrap(elWithId("narration", "n1", "Hello")),
			wrap(elWithId("image", "img1", "sunset")),
		]);
		expect(result).toContain("--- Scene 1 ---");
		expect(result).toContain("--- Scene 2 ---");
	});

	it("serializes elements with ids inside scenes", () => {
		const result = OSMLSerializer.serializeWithScenes([
			wrap(elWithId("narration", "n1", "Hello")),
		]);
		expect(result).toContain('<narration id="n1">Hello</narration>');
	});

	it("groups elements under their scene", () => {
		const result = OSMLSerializer.serializeWithScenes([
			wrap(
				elWithId("narration", "n1", "first"),
				elWithId("sound", "s1", "rain", { type: "ambient" }),
			),
		]);
		const lines = result.split("\n").filter(Boolean);
		expect(lines[0]).toBe("--- Scene 1 ---");
		expect(lines[1]).toContain("n1");
		expect(lines[2]).toContain("s1");
	});

	it("ignores non-scene top-level nodes", () => {
		// serializeWithScenes only walks scene elements
		const result = OSMLSerializer.serializeWithScenes([
			wrap(elWithId("narration", "n1", "hello")),
		]);
		expect(result).toContain("Scene 1");
		expect(result).not.toContain("Scene 2");
	});
});

describe("OSMLSerializer.getTextContent", () => {
	it("extracts joined text from children", () => {
		const element: CanvasContentElement = {
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
