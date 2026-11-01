import { describe, expect, it } from "vitest";
import { OSMLStreamParser, parseOSML } from "../osml-stream-parser";
import { getElementBodyText, getElementText } from "../osml-serializer";
import { isAssetElement } from "../guards";
import { DEFAULT_IMAGE_MODEL } from "@/lib/connectors/image/models";
import { DEFAULT_VIDEO_MODEL } from "@/lib/connectors/video/models";
import { flatAttributes } from "@/lib/canvas/element-attributes";

const read = (...chunks: string[]) => {
	const parser = new OSMLStreamParser();
	return chunks.map((chunk) => parser.appendChunk(chunk));
};

describe("OSMLStreamParser", () => {
	it("reads a single complete tag", () => {
		const [elements] = read("<image>a sunset</image>");

		expect(elements).toMatchObject([{ type: "image", text: "a sunset" }]);
	});

	it("reads a tag and its text split across chunks", () => {
		const parser = new OSMLStreamParser();
		parser.appendChunk("<char");
		parser.appendChunk('acter name="Al');
		const [opened] = parser.appendChunk('ice">Hello');
		const [grown] = parser.appendChunk(" world</character>");

		expect(grown).toBe(opened);
		expect(grown).toMatchObject({
			type: "character",
			attrs: { name: "Alice" },
			text: "Hello world",
		});
	});

	it("returns an element once per chunk, however often the chunk touches it", () => {
		const [elements] = read("<narration>Once</narration> upon <image>");

		expect(elements).toMatchObject([
			{ type: "narration", text: "Once upon " },
			{ type: "image", text: "" },
		]);
	});

	it("returns nothing for a chunk that changes nothing", () => {
		expect(read("<narration>Once</narration>", "\n", "<unk")).toEqual([
			[expect.objectContaining({ text: "Once" })],
			[],
			[],
		]);
	});

	it("flushes plain text after the buffer threshold", () => {
		const [, [grown]] = read("<narration>", "Some long narration text here");

		expect(grown?.text).toBe("Some long narration text here");
	});

	it("decodes an entity split across chunk boundaries", () => {
		const [, [grown]] = read(
			"<narration>Rock &a",
			"mp; Roll forever</narration>",
		);

		expect(grown?.text).toBe("Rock & Roll forever");
	});

	it("drops an unknown tag along with its text", () => {
		const [elements] = read(
			"<narration>Once</narration><unknowntag>stray words</unknowntag>",
		);

		expect(elements).toMatchObject([{ type: "narration", text: "Once" }]);
	});

	it("reads assets and content in the order they were written", () => {
		const types = read(
			"<asset_style>dark moody tones</asset_style>",
			"<narration>Once upon a time</narration>",
			'<asset_avatar name="Bob">tall and thin</asset_avatar>',
		)
			.flat()
			.map((element) => element.type);

		expect(types).toEqual(["asset_style", "narration", "asset_avatar"]);
	});

	it("takes an id attribute as the element's id and gives the rest one", () => {
		const [[given, made]] = read(
			'<sound id="abc">thunder</sound><sound>rain</sound>',
		);

		expect(given).toMatchObject({ id: "abc", attrs: {} });
		expect(made?.id).toMatch(/^.{16}$/);
	});

	it("keeps the text as written", () => {
		const [[element]] = read("<narration> Once upon\n a time </narration>");

		expect(element?.text).toBe(" Once upon\n a time ");
	});
});

describe("parseOSML", () => {
	it("parses a complete OSML string in one shot", () => {
		const nodes = parseOSML("<narration>Once upon a time</narration>");
		expect(nodes).toHaveLength(1);
		expect(nodes[0].type).toBe("narration");
		expect(getElementText(nodes[0])).toContain("Once upon a time");
	});

	it("keeps the text as written", () => {
		const [node] = parseOSML("<narration> Once upon\n a time </narration>");
		expect(getElementBodyText(node)).toBe(" Once upon\n a time ");
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
			'<asset_voice name="Mia" gender="masculine" age="adult" pickedVoiceId="v1"></asset_voice>' +
				'<asset_references images="https://img/a.png,https://img/b.png"></asset_references>',
		);

		expect(voice).toMatchObject({
			type: "asset_voice",
			generationAttributes: {
				name: "Mia",
				gender: "masculine",
				age: "adult",
				pickedVoiceId: "v1",
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

	it("parses attributes correctly", () => {
		const [node] = parseOSML('<sound loops="3" volume="8">boom</sound>');

		expect(flatAttributes(node)).toMatchObject({
			loops: "3",
			volume: "8",
		});
	});

	it("replaces an attribute value the schema doesn't offer with its default", () => {
		const [node] = parseOSML('<sound volume="loud">boom</sound>');

		expect(flatAttributes(node).volume).toBe("2");
	});

	it("backfills defaultAttributes", () => {
		const nodes = parseOSML(
			"<sound>thunder</sound><music>epic orchestral</music>",
		);

		expect(flatAttributes(nodes[0]).loops).toBe("1");
		expect(flatAttributes(nodes[1]).loops).toBe("1");
	});

	it("preserves an explicit id attribute as node.id", () => {
		const [node] = parseOSML('<sound id="abc">thunder</sound>');

		expect(node.id).toBe("abc");
		expect(flatAttributes(node).id).toBeUndefined();
	});

	it("parses <video> with a startFrame attribute", () => {
		const [node] = parseOSML(
			'<video startFrame="previous">a dark forest</video>',
		);

		expect(node.type).toBe("video");
		expect(flatAttributes(node).startFrame).toBe("previous");
		expect(getElementText(node)).toContain("a dark forest");
	});

	it("hydrates the schema's model", () => {
		const [node] = parseOSML("<image>a sunset</image>");

		expect(flatAttributes(node)).toMatchObject(DEFAULT_IMAGE_MODEL);
	});

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
});
