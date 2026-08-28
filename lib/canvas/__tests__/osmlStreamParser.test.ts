import { describe, expect, it } from "vitest";
import { OSMLStreamParser, parseOSML } from "../osmlStreamParser";
import { getElementText } from "../osmlSerializer";
import type { ParsedElement } from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import { flatAttributes } from "@/lib/video/elementAttributes";

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
	animated_image: {
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

describe("OSMLStreamParser", () => {
	it("parses a single complete tag", () => {
		const s = new OSMLStreamParser();
		s.appendChunk("<image>a sunset</image>", connectors);
		const nodes = s.getNodes() as ParsedElement[];

		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("image");
		expect(getElementText(nodes[0])).toContain("a sunset");
	});

	it("handles streaming chunks across tag boundaries", () => {
		const s = new OSMLStreamParser();
		s.appendChunk("<char", connectors);
		s.appendChunk('acter name="Al', connectors);
		s.appendChunk('ice">Hello', connectors);
		s.appendChunk(" world</character>", connectors);

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("character");
		expect(flatAttributes(nodes[0]).name).toBe("Alice");
		expect(getElementText(nodes[0])).toContain("Hello world");
	});

	it("flushes plain text after buffer threshold", () => {
		const s = new OSMLStreamParser();
		// Need an initial node for text to append to
		s.appendChunk("<narration>", connectors);
		s.appendChunk("Some long narration text here", connectors);

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(getElementText(nodes[0])).toContain("Some long narration text here");
	});

	it("decodes an entity split across chunk boundaries", () => {
		const s = new OSMLStreamParser();
		s.appendChunk("<narration>Rock &a", connectors);
		s.appendChunk("mp; Roll forever</narration>", connectors);

		const nodes = s.getNodes() as ParsedElement[];
		expect(getElementText(nodes[0])).toContain("Rock & Roll forever");
	});

	it("preserves raw tag name for unknown tags", () => {
		const s = new OSMLStreamParser();
		s.appendChunk("<unknowntag>content</unknowntag>", connectors);

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("unknowntag");
	});

	it("parses metadata_style metadata tag", () => {
		const s = new OSMLStreamParser();
		s.appendChunk(
			"<metadata_style>Warm earth tones with watercolor style</metadata_style>",
			connectors,
		);

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("metadata_style");
		expect(nodes[0].children[0].text).toBe(
			"Warm earth tones with watercolor style",
		);
	});

	it("parses metadata_character metadata tag with name attribute", () => {
		const s = new OSMLStreamParser();
		s.appendChunk(
			'<metadata_character name="Mia">Brown hair, green eyes</metadata_character>',
			connectors,
		);

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("metadata_character");
		expect(nodes[0].customAttributes?.name).toBe("Mia");
		expect(nodes[0].children[0].text).toBe("Brown hair, green eyes");
	});

	it("parses metadata_narration with voice attributes", () => {
		const s = new OSMLStreamParser();
		s.appendChunk(
			'<metadata_narration gender="masculine" age="adult" pitch="low" accent="british" description="wise"></metadata_narration>',
			connectors,
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
		const s = new OSMLStreamParser();
		s.appendChunk(
			"<metadata_style>dark moody tones</metadata_style>",
			connectors,
		);
		s.appendChunk("<narration>Once upon a time</narration>", connectors);
		s.appendChunk(
			'<metadata_character name="Bob">tall and thin</metadata_character>',
			connectors,
		);

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(3);
		expect(nodes[0].type).toBe("metadata_style");
		expect(nodes[1].type).toBe("narration");
		expect(nodes[2].type).toBe("metadata_character");
	});

	it("parses attributes correctly", () => {
		const s = new OSMLStreamParser();
		s.appendChunk(
			'<sound effect="thunder" volume="loud">boom</sound>',
			connectors,
		);

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(flatAttributes(nodes[0])).toMatchObject({
			effect: "thunder",
			volume: "loud",
		});
	});

	it("backfills defaultAttributes for streamed canvas elements", () => {
		const s = new OSMLStreamParser();
		s.appendChunk("<sound>thunder</sound>", connectors);
		s.appendChunk("<music>epic orchestral</music>", connectors);

		const nodes = s.getNodes() as ParsedElement[];
		expect(flatAttributes(nodes[0]).loops).toBe("1");
		expect(flatAttributes(nodes[1]).loops).toBe("1");
	});

	it("preserves explicit id attribute as node.id for canvas elements", () => {
		const s = new OSMLStreamParser();
		s.appendChunk('<sound id="abc">thunder</sound>', connectors);

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes[0].id).toBe("abc");
		expect(flatAttributes(nodes[0]).id).toBeUndefined();
	});

	it("parses <animated_image> with a videoPrompt attribute", () => {
		const s = new OSMLStreamParser();
		s.appendChunk(
			'<animated_image videoPrompt="slow zoom in">a dark forest</animated_image>',
			connectors,
		);

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("animated_image");
		expect(flatAttributes(nodes[0]).videoPrompt).toBe("slow zoom in");
		expect(getElementText(nodes[0])).toContain("a dark forest");
	});

	it("hydrates connector model and provider on streamed canvas elements", () => {
		const s = new OSMLStreamParser();
		s.appendChunk("<image>a sunset</image>", connectors);

		const nodes = s.getNodes() as ParsedElement[];
		expect(flatAttributes(nodes[0])).toMatchObject({
			model: "m",
			provider: "openslop",
		});
	});
});

describe("parseOSML", () => {
	it("parses a complete OSML string in one shot", () => {
		const nodes = parseOSML(
			"<narration>Once upon a time</narration>",
			connectors,
		);
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("narration");
		expect(getElementText(nodes[0])).toContain("Once upon a time");
	});
});

describe("OSMLStreamParser update signalling", () => {
	it("reports an update for a chunk that only opens a tag", () => {
		const s = new OSMLStreamParser();
		expect(s.appendChunk("<narration>", connectors)).toBe(true);
		expect(s.getNodes()).toHaveLength(1);
	});

	it("reports an update for a body-less metadata tag", () => {
		const s = new OSMLStreamParser();
		expect(
			s.appendChunk(
				'<metadata_narration voiceId="v1"></metadata_narration>',
				connectors,
			),
		).toBe(true);
		expect(s.getNodes()).toHaveLength(1);
	});

	it("reports no update for a chunk that adds nothing", () => {
		const s = new OSMLStreamParser();
		expect(s.appendChunk("<im", connectors)).toBe(false);
	});
});
