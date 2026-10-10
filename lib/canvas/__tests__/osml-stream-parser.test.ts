import { describe, expect, it } from "vitest";
import { OSMLStreamParser, parseOSML } from "../osml-stream-parser";
import { getElementBodyText, getElementText } from "../osml-serializer";
import { isAssetElement } from "../guards";
import { DEFAULT_IMAGE_MODEL } from "@/lib/connectors/image/models";
import { DEFAULT_VIDEO_MODEL } from "@/lib/connectors/video/models";
import { flatAttributes } from "@/lib/canvas/element-attributes";

describe("OSMLStreamParser", () => {
	it("parses a single complete tag", () => {
		const s = new OSMLStreamParser();
		s.appendChunk("<image>a sunset</image>");
		const nodes = s.getNodes();

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

		const nodes = s.getNodes();
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

		const nodes = s.getNodes();
		expect(nodes).toHaveLength(1);
		expect(getElementText(nodes[0])).toContain("Some long narration text here");
	});

	it("decodes an entity split across chunk boundaries", () => {
		const s = new OSMLStreamParser();
		s.appendChunk("<narration>Rock &a");
		s.appendChunk("mp; Roll forever</narration>");

		const nodes = s.getNodes();
		expect(getElementText(nodes[0])).toContain("Rock & Roll forever");
	});

	it("drops an unknown tag along with its text", () => {
		const nodes = parseOSML(
			"<narration>Once</narration><unknowntag>stray words</unknowntag>",
		);

		expect(nodes.map((node) => [node.type, getElementBodyText(node)])).toEqual([
			["narration", "Once"],
		]);
	});

	it("parses asset tags into assets, keeping their ids, attributes and text", () => {
		const pinned = { provider: "runware", model: "Seedream 5 Lite" };
		const [avatar, style] = parseOSML(
			'<asset_avatar name="Mia" provider="runware" model="Seedream 5 Lite">Brown hair</asset_avatar>' +
				'<asset_style id="e9">ink wash</asset_style>',
		);

		expect(isAssetElement(avatar) && isAssetElement(style)).toBe(true);
		expect(avatar).toMatchObject({
			type: "asset_avatar",
			generationAttributes: { name: "Mia", ...pinned },
		});
		expect(style).toMatchObject({
			id: "e9",
			generationAttributes: {},
		});
		expect(getElementBodyText(avatar)).toBe("Brown hair");
		expect(getElementBodyText(style)).toBe("ink wash");
	});

	it("parses voice and references tags with their attributes as written", () => {
		const [voice, references] = parseOSML(
			'<asset_voice name="Mia" gender="masculine" age="adult" voiceId="v1"></asset_voice>' +
				'<asset_references images="https://img/a.png,https://img/b.png"></asset_references>',
		);

		expect(voice).toMatchObject({
			type: "asset_voice",
			generationAttributes: {
				name: "Mia",
				gender: "masculine",
				age: "adult",
				voiceId: "v1",
			},
		});
		expect(references).toMatchObject({
			type: "asset_references",
			generationAttributes: { images: "https://img/a.png,https://img/b.png" },
		});
	});

	it("puts an asset that names no model on the default one", () => {
		const pinned = { provider: "runware", model: "Seedream 5 Lite" } as const;
		const [avatar] = parseOSML('<asset_avatar name="Mia"></asset_avatar>', {
			image: pinned,
		});

		expect(avatar.generationAttributes).toEqual({ name: "Mia", ...pinned });
	});

	it("parses assets and canvas tags in the order they were written", () => {
		const s = new OSMLStreamParser();
		s.appendChunk("<asset_style>dark moody tones</asset_style>");
		s.appendChunk("<narration>Once upon a time</narration>");
		s.appendChunk('<asset_avatar name="Bob">tall and thin</asset_avatar>');

		const nodes = s.getNodes();
		expect(nodes.map((node) => node.type)).toEqual([
			"asset_style",
			"narration",
			"asset_avatar",
		]);
		expect(getElementBodyText(nodes[0])).toBe("dark moody tones");
	});

	it("parses attributes correctly", () => {
		const s = new OSMLStreamParser();
		s.appendChunk('<sound effect="thunder" volume="8">boom</sound>');

		const nodes = s.getNodes();
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

		const nodes = s.getNodes();
		expect(flatAttributes(nodes[0]).loops).toBe("1");
		expect(flatAttributes(nodes[1]).loops).toBe("1");
	});

	it("preserves explicit id attribute as node.id for canvas elements", () => {
		const s = new OSMLStreamParser();
		s.appendChunk('<sound id="abc">thunder</sound>');

		const nodes = s.getNodes();
		expect(nodes[0].id).toBe("abc");
		expect(flatAttributes(nodes[0]).id).toBeUndefined();
	});

	it("parses <video> with a startFrame attribute", () => {
		const s = new OSMLStreamParser();
		s.appendChunk('<video startFrame="img1">a dark forest</video>');

		const nodes = s.getNodes();
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("video");
		expect(flatAttributes(nodes[0]).startFrame).toBe("img1");
		expect(getElementText(nodes[0])).toContain("a dark forest");
	});

	it("hydrates the schema's model on streamed canvas elements", () => {
		const s = new OSMLStreamParser();
		s.appendChunk("<image>a sunset</image>");

		const nodes = s.getNodes();
		expect(flatAttributes(nodes[0])).toMatchObject(DEFAULT_IMAGE_MODEL);
	});
});

describe("parseOSML", () => {
	// A saved project is reloaded through here, so a clobbered model would be a
	// model pick that never survives a reload.
	it("keeps a model the OSML names over the schema default", () => {
		const [node] = parseOSML(
			'<video provider="runware" model="Seedance 2 Fast">a sunset</video>',
		);
		expect(flatAttributes(node)).toMatchObject({
			provider: "runware",
			model: "Seedance 2 Fast",
		});
	});

	it("replaces a model the catalog no longer offers", () => {
		const [node] = parseOSML('<video model="Slop Video v0">a sunset</video>');
		expect(flatAttributes(node)).toMatchObject(DEFAULT_VIDEO_MODEL);
	});

	it("parses a complete OSML string in one shot", () => {
		const nodes = parseOSML("<narration>Once upon a time</narration>");
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("narration");
		expect(getElementText(nodes[0])).toContain("Once upon a time");
	});
});
