import { describe, expect, it } from "vitest";
import { OSMLSerializer } from "../utils/osmlSerializer";
import {
	SCENE_TYPE,
	type CanvasContentElement,
	type ParsedElement,
	type SceneElement,
} from "../types";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";

const connectors: ConnectorRegistry = {
	llm: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true, apiKey: "" },
	},
	tts: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true, apiKey: "" },
	},
	image: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true, apiKey: "" },
	},
	video: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true, apiKey: "" },
	},
	sfx: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true, apiKey: "" },
	},
	music: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true, apiKey: "" },
	},
};

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
			wrap(el("character", "Hi there", { name: "Lyra", emotion: "excited" })),
		]);
		expect(result).toBe(
			'<character id="e1" name="Lyra" emotion="excited">Hi there</character>',
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
		const s = new OSMLSerializer(connectors);
		s.appendChunk("<image>a sunset</image>");
		const nodes = s.getNodes() as ParsedElement[];

		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("image");
		expect(OSMLSerializer.getTextContent(nodes[0])).toContain("a sunset");
	});

	it("handles streaming chunks across tag boundaries", () => {
		const s = new OSMLSerializer(connectors);
		s.appendChunk("<char");
		s.appendChunk('acter name="Al');
		s.appendChunk('ice">Hello');
		s.appendChunk(" world</character>");

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("character");
		expect(nodes[0].customAttributes?.name).toBe("Alice");
		expect(OSMLSerializer.getTextContent(nodes[0])).toContain("Hello world");
	});

	it("flushes plain text after buffer threshold", () => {
		const s = new OSMLSerializer(connectors);
		// Need an initial node for text to append to
		s.appendChunk("<narration>");
		s.appendChunk("Some long narration text here");

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(OSMLSerializer.getTextContent(nodes[0])).toContain(
			"Some long narration text here",
		);
	});

	it("preserves raw tag name for unknown tags", () => {
		const s = new OSMLSerializer(connectors);
		s.appendChunk("<unknowntag>content</unknowntag>");

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("unknowntag");
	});

	it("parses metadata_style metadata tag", () => {
		const s = new OSMLSerializer(connectors);
		s.appendChunk(
			"<metadata_style>Warm earth tones with watercolor style</metadata_style>",
		);

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("metadata_style");
		expect(nodes[0].children[0].text).toBe(
			"Warm earth tones with watercolor style",
		);
	});

	it("parses metadata_character metadata tag with name attribute", () => {
		const s = new OSMLSerializer(connectors);
		s.appendChunk(
			'<metadata_character name="Mia">Brown hair, green eyes</metadata_character>',
		);

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("metadata_character");
		expect(nodes[0].customAttributes?.name).toBe("Mia");
		expect(nodes[0].children[0].text).toBe("Brown hair, green eyes");
	});

	it("parses metadata_narration with voice attributes", () => {
		const s = new OSMLSerializer(connectors);
		s.appendChunk(
			'<metadata_narration gender="masculine" age="adult" pitch="low" accent="british" description="wise"></metadata_narration>',
		);

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("metadata_narration");
		expect(nodes[0].customAttributes).toEqual({
			gender: "masculine",
			age: "adult",
			pitch: "low",
			accent: "british",
			description: "wise",
		});
	});

	it("parses mixed canvas and metadata tags", () => {
		const s = new OSMLSerializer(connectors);
		s.appendChunk("<metadata_style>dark moody tones</metadata_style>");
		s.appendChunk("<narration>Once upon a time</narration>");
		s.appendChunk(
			'<metadata_character name="Bob">tall and thin</metadata_character>',
		);

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(3);
		expect(nodes[0].type).toBe("metadata_style");
		expect(nodes[1].type).toBe("narration");
		expect(nodes[2].type).toBe("metadata_character");
	});

	it("parses attributes correctly", () => {
		const s = new OSMLSerializer(connectors);
		s.appendChunk('<sound effect="thunder" volume="loud">boom</sound>');

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(nodes[0].customAttributes).toMatchObject({
			effect: "thunder",
			volume: "loud",
		});
	});

	it("backfills defaultAttributes for streamed canvas elements", () => {
		const s = new OSMLSerializer(connectors);
		s.appendChunk("<sound>thunder</sound>");
		s.appendChunk("<music>epic orchestral</music>");

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes[0].customAttributes?.loops).toBe("1");
		expect(nodes[1].customAttributes?.loops).toBe("1");
	});

	it("preserves explicit id attribute as node.id for canvas elements", () => {
		const s = new OSMLSerializer(connectors);
		s.appendChunk('<sound id="abc">thunder</sound>');

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes[0].id).toBe("abc");
		expect(nodes[0].customAttributes?.id).toBeUndefined();
	});

	it("hydrates connector model and provider on streamed canvas elements", () => {
		const s = new OSMLSerializer(connectors);
		s.appendChunk("<image>a sunset</image>");

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes[0].customAttributes).toMatchObject({
			model: "m",
			provider: "openslop",
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
				elWithId("sound", "s1", "rain", { loops: "3" }),
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
