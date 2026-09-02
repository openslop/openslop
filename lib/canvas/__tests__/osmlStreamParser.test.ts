import { describe, expect, it } from "vitest";
import { OSMLStreamParser, parseOSML } from "../osmlStreamParser";
import { getElementText } from "../osmlSerializer";
import type { ParsedElement } from "@/lib/canvas/types";
import { DEFAULT_IMAGE_MODEL } from "@/lib/connectors/image/models";
import { DEFAULT_VIDEO_MODEL } from "@/lib/connectors/video/models";
import { flatAttributes } from "@/lib/video/elementAttributes";

describe("OSMLStreamParser", () => {
	it("parses a single complete tag", () => {
		const s = new OSMLStreamParser();
		s.appendChunk("<image>a sunset</image>");
		const nodes = s.getNodes() as ParsedElement[];

		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("image");
		expect(getElementText(nodes[0])).toContain("a sunset");
	});

	it("handles streaming chunks across tag boundaries", () => {
		const s = new OSMLStreamParser();
		s.appendChunk("<char");
		s.appendChunk('acter name="Al');
		s.appendChunk('ice">Hello');
		s.appendChunk(" world</character>");

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("character");
		expect(flatAttributes(nodes[0]).name).toBe("Alice");
		expect(getElementText(nodes[0])).toContain("Hello world");
	});

	it("flushes plain text after buffer threshold", () => {
		const s = new OSMLStreamParser();
		// Need an initial node for text to append to
		s.appendChunk("<narration>");
		s.appendChunk("Some long narration text here");

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(getElementText(nodes[0])).toContain("Some long narration text here");
	});

	it("decodes an entity split across chunk boundaries", () => {
		const s = new OSMLStreamParser();
		s.appendChunk("<narration>Rock &a");
		s.appendChunk("mp; Roll forever</narration>");

		const nodes = s.getNodes() as ParsedElement[];
		expect(getElementText(nodes[0])).toContain("Rock & Roll forever");
	});

	it("preserves raw tag name for unknown tags", () => {
		const s = new OSMLStreamParser();
		s.appendChunk("<unknowntag>content</unknowntag>");

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("unknowntag");
	});

	it("parses metadata_style metadata tag", () => {
		const s = new OSMLStreamParser();
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
		const s = new OSMLStreamParser();
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
		const s = new OSMLStreamParser();
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
		const s = new OSMLStreamParser();
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
		const s = new OSMLStreamParser();
		s.appendChunk('<sound effect="thunder" volume="8">boom</sound>');

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(flatAttributes(nodes[0])).toMatchObject({
			effect: "thunder",
			volume: "8",
		});
	});

	it("replaces an attribute value the schema doesn't offer with its default", () => {
		const s = new OSMLStreamParser();
		s.appendChunk('<sound volume="loud">boom</sound>');

		expect(flatAttributes(s.getNodes()[0]).volume).toBe("2");
	});

	it("backfills defaultAttributes for streamed canvas elements", () => {
		const s = new OSMLStreamParser();
		s.appendChunk("<sound>thunder</sound>");
		s.appendChunk("<music>epic orchestral</music>");

		const nodes = s.getNodes() as ParsedElement[];
		expect(flatAttributes(nodes[0]).loops).toBe("1");
		expect(flatAttributes(nodes[1]).loops).toBe("1");
	});

	it("preserves explicit id attribute as node.id for canvas elements", () => {
		const s = new OSMLStreamParser();
		s.appendChunk('<sound id="abc">thunder</sound>');

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes[0].id).toBe("abc");
		expect(flatAttributes(nodes[0]).id).toBeUndefined();
	});

	it("parses <animated_image> with a videoPrompt attribute", () => {
		const s = new OSMLStreamParser();
		s.appendChunk(
			'<animated_image videoPrompt="slow zoom in">a dark forest</animated_image>',
		);

		const nodes = s.getNodes() as ParsedElement[];
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("animated_image");
		expect(flatAttributes(nodes[0]).videoPrompt).toBe("slow zoom in");
		expect(getElementText(nodes[0])).toContain("a dark forest");
	});

	it("hydrates the schema's model on streamed canvas elements", () => {
		const s = new OSMLStreamParser();
		s.appendChunk("<image>a sunset</image>");

		const nodes = s.getNodes() as ParsedElement[];
		expect(flatAttributes(nodes[0])).toMatchObject(DEFAULT_IMAGE_MODEL);
	});
});

describe("parseOSML", () => {
	// A saved project is reloaded through here, so a clobbered model would be a
	// model pick that never survives a reload.
	it("keeps a model the OSML names over the schema default", () => {
		const [node] = parseOSML(
			'<animated_image provider="runware" model="Seedance 2 Fast" imageProvider="runware" imageModel="Seedream 5 Lite">a sunset</animated_image>',
		);
		expect(flatAttributes(node)).toMatchObject({
			provider: "runware",
			model: "Seedance 2 Fast",
			imageProvider: "runware",
			imageModel: "Seedream 5 Lite",
		});
	});

	it("replaces a model the catalog no longer offers", () => {
		const [node] = parseOSML(
			'<animated_image model="Slop Video v0">a sunset</animated_image>',
		);
		expect(flatAttributes(node)).toMatchObject(DEFAULT_VIDEO_MODEL);
	});

	it("parses a complete OSML string in one shot", () => {
		const nodes = parseOSML("<narration>Once upon a time</narration>");
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("narration");
		expect(getElementText(nodes[0])).toContain("Once upon a time");
	});
});
