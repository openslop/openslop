import { describe, expect, it } from "vitest";
import { imageAttributesFor } from "@/lib/connectors/image/attributes";
import { DEFAULT_IMAGE_MODEL } from "@/lib/connectors/image/models";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import { TTS_ATTRIBUTES } from "@/lib/connectors/tts/attributes";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { videoAttributesFor } from "@/lib/connectors/video/attributes";
import { NARRATOR } from "../assets";
import { createCanvasElement } from "../create-canvas-element";
import {
	attributeSchemaFor,
	elementSchema,
	resolveElementConnector,
} from "../element-connector";
import { ElementTypeSchema, type ContentElement } from "../types";
import { flatAttributes } from "@/lib/canvas/element-attributes";
import { asset, element } from "./_assets";

const el = (
	type: ContentElement["type"],
	attributes: Record<string, string> = {},
) => element("n1", type, "", attributes);

const registry = DEFAULT_CONNECTOR_REGISTRY;
const imageDefaults = registry.image;

describe("resolveElementConnector", () => {
	it("maps the element type to its connector type", () => {
		expect(resolveElementConnector(el("narration"), registry, []).type).toBe(
			"tts",
		);
		expect(resolveElementConnector(el("video"), registry, []).type).toBe(
			"video",
		);
	});

	it("falls back to the recommendation when nothing is pinned", () => {
		expect(resolveElementConnector(el("image"), registry, [])).toEqual({
			type: "image",
			model: DEFAULT_IMAGE_MODEL,
			config: imageDefaults,
		});
	});

	it("keeps a pinned model over the recommendation", () => {
		const pinned = { provider: "runware", model: "Seedream 5 Lite" };
		expect(
			resolveElementConnector(el("image", pinned), registry, []).model,
		).toEqual(pinned);
	});

	it("falls back when the pinned provider no longer serves the model", () => {
		const connector = resolveElementConnector(
			el("image", { provider: "retired-vendor", model: "Seedream 5 Lite" }),
			registry,
			[],
		);
		expect(connector.model).toEqual(DEFAULT_IMAGE_MODEL);
		expect(connector.config).toBe(imageDefaults);
	});
});

describe("resolveElementConnector for speech", () => {
	const voiced = (pair: typeof DEFAULT_MODELS.tts) => [
		asset("asset_voice", { name: NARRATOR, attrs: pair }),
	];
	const own = { provider: "cartesia", model: "Sonic 3.6" };

	it("speaks with the pair its voice picked, over its own", () => {
		expect(
			resolveElementConnector(
				el("narration", own),
				registry,
				voiced(DEFAULT_MODELS.tts),
			).model,
		).toEqual(DEFAULT_MODELS.tts);
	});

	it("speaks with its own pair while its speaker has no voice", () => {
		expect(
			resolveElementConnector(el("narration", own), registry, []).model,
		).toEqual(own);
		expect(
			resolveElementConnector(
				el("character", { name: "Red", ...own }),
				registry,
				voiced(DEFAULT_MODELS.tts),
			).model,
		).toEqual(own);
	});

	it("falls back to the recommendation when neither names a model", () => {
		expect(
			resolveElementConnector(el("character"), registry, []).model,
		).toEqual(DEFAULT_MODELS.tts);
	});
});

describe("resolveElementConnector for an avatar", () => {
	it("draws the character's look on the image connector, with the model it pins", () => {
		const pinned = { provider: "runware", model: "Seedream 5 Lite" };
		const avatar = asset("asset_avatar", { name: "Mia", attrs: pinned });

		expect(resolveElementConnector(avatar, registry, [avatar])).toEqual({
			type: "image",
			model: pinned,
			config: registry.asset_avatar,
		});
	});
});

describe("createCanvasElement", () => {
	it("stores the resolved pair, so the element names its own provider", () => {
		const node = createCanvasElement("image", {
			attrs: { provider: "retired-vendor" },
		});

		expect(resolveElementConnector(node, registry, []).model).toEqual(
			DEFAULT_IMAGE_MODEL,
		);
		expect(resolveElementConnector(node, registry, []).config).toBe(
			imageDefaults,
		);
	});
});

describe("elementSchema", () => {
	it("resolves the connector type's schema from the element's own attributes", () => {
		expect(elementSchema(el("image")).keys).toEqual(
			expect.arrayContaining(imageAttributesFor(DEFAULT_MODELS.image).keys),
		);
		expect(elementSchema(el("video")).keys).toEqual(
			expect.arrayContaining(videoAttributesFor(DEFAULT_MODELS.video).keys),
		);
		expect(elementSchema(el("narration")).keys).toEqual(
			expect.arrayContaining(TTS_ATTRIBUTES.keys),
		);
	});

	it("lets any speech line name its speaker", () => {
		expect(attributeSchemaFor("character").keys).toContain("name");
		expect(attributeSchemaFor("narration").keys).toContain("name");
	});

	it("offers every attribute an element is created with, and no made-up key", () => {
		for (const type of ElementTypeSchema.options) {
			const created = flatAttributes(createCanvasElement(type));
			const schema = attributeSchemaFor(type, created);
			for (const [key, value] of Object.entries(created))
				expect(schema.offers(key, value)).toBe(true);
			expect(schema.offers("tone", "dry")).toBe(false);
		}
	});
});

describe("asset schemas", () => {
	const voice = attributeSchemaFor("asset_voice");

	it("lets a voice set its traits, each one optional, and describe itself", () => {
		expect(voice.settingsDefs.map(({ key }) => key)).toEqual([
			"gender",
			"language",
			"age",
			"pitch",
			"accent",
			"description",
		]);
	});

	it("gives every asset but a voice nothing to set beside its text", () => {
		for (const type of [
			"asset_avatar",
			"asset_style",
			"asset_references",
		] as const)
			expect(attributeSchemaFor(type).settingsDefs).toEqual([]);
	});

	it("drops what an asset holds outside its schema when it is created", () => {
		expect(
			flatAttributes(
				asset("asset_voice", {
					name: "Mia",
					attrs: { tone: "dry", gender: "feminine" },
				}),
			),
		).toEqual({
			name: "Mia",
			...DEFAULT_MODELS.voice,
			gender: "feminine",
		});
	});
});

describe("media drafts", () => {
	it("take the attributes of the type they draft", () => {
		const attrs = { provider: DEFAULT_IMAGE_MODEL.provider };
		expect(attributeSchemaFor("asset_media_image", attrs).keys).toEqual(
			attributeSchemaFor("image", attrs).keys,
		);
		expect(attributeSchemaFor("asset_media_video").keys).toEqual(
			attributeSchemaFor("video").keys,
		);
	});

	it("generate on the connector and plugins of the type they draft", () => {
		const draft = asset("asset_media_image");
		const connector = resolveElementConnector(draft, registry, [draft]);
		expect(connector.type).toBe("image");
		expect(connector.config).toBe(registry.image);
	});
});
