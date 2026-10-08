import { describe, expect, it } from "vitest";
import { IMAGE_ATTRIBUTES } from "@/lib/connectors/image/attributes";
import { DEFAULT_IMAGE_MODEL } from "@/lib/connectors/image/models";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import { TTS_ATTRIBUTES } from "@/lib/connectors/tts/attributes";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { videoAttributesFor } from "@/lib/connectors/video/attributes";
import { NARRATOR } from "../assets";
import { createCanvasNode } from "../createCanvasNode";
import {
	attributeSchemaFor,
	elementModelPick,
	elementSchema,
	resolveElementConnector,
} from "../elementConnector";
import type { CanvasContentElement } from "../types";
import {
	flatAttributes,
	splitAttributes,
} from "@/lib/canvas/elementAttributes";
import { asset } from "./_assets";

function element(
	type: CanvasContentElement["type"],
	customAttributes?: Record<string, string>,
): CanvasContentElement {
	return {
		id: "n1",
		type,
		...splitAttributes(customAttributes ?? {}),
		children: [],
	};
}

const registry = DEFAULT_CONNECTOR_REGISTRY;
const imageDefaults = registry.image;

describe("resolveElementConnector", () => {
	it("maps the element type to its connector type", () => {
		expect(
			resolveElementConnector(element("narration"), registry, []).type,
		).toBe("tts");
		expect(resolveElementConnector(element("video"), registry, []).type).toBe(
			"video",
		);
	});

	it("falls back to the recommendation when nothing is pinned", () => {
		expect(resolveElementConnector(element("image"), registry, [])).toEqual({
			type: "image",
			model: DEFAULT_IMAGE_MODEL,
			config: imageDefaults,
		});
	});

	it("keeps a pinned model over the recommendation", () => {
		const pinned = { provider: "runware", model: "Seedream 5 Lite" };
		expect(
			resolveElementConnector(element("image", pinned), registry, []).model,
		).toEqual(pinned);
	});

	it("falls back when the pinned provider no longer serves the model", () => {
		const connector = resolveElementConnector(
			element("image", { provider: "retired-vendor", model: "Slop Image v1" }),
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
				element("narration", own),
				registry,
				voiced(DEFAULT_MODELS.tts),
			).model,
		).toEqual(DEFAULT_MODELS.tts);
	});

	it("speaks with its own pair while its speaker has no voice", () => {
		expect(
			resolveElementConnector(element("narration", own), registry, []).model,
		).toEqual(own);
		expect(
			resolveElementConnector(
				element("character", { name: "Red", ...own }),
				registry,
				voiced(DEFAULT_MODELS.tts),
			).model,
		).toEqual(own);
	});

	it("falls back to the recommendation when neither names a model", () => {
		expect(
			resolveElementConnector(element("character"), registry, []).model,
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

describe("createCanvasNode", () => {
	it("stores the resolved pair, so the element names its own provider", () => {
		const node = createCanvasNode("image", {
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
		expect(elementSchema(element("image")).keys).toEqual(IMAGE_ATTRIBUTES.keys);
		expect(elementSchema(element("video")).keys).toEqual(
			videoAttributesFor(DEFAULT_MODELS.video).keys,
		);
		expect(elementSchema(element("narration")).keys).toEqual(
			TTS_ATTRIBUTES.keys,
		);
	});
});

describe("asset schemas", () => {
	const voice = attributeSchemaFor("asset_voice", {});

	it("lets a voice set its traits, each one optional, describe itself, and carry its speech pair", () => {
		expect(voice.keys).toEqual([
			"gender",
			"language",
			"age",
			"pitch",
			"accent",
			"description",
			"provider",
			"model",
		]);
		expect(voice.defaultAttributes).toEqual(DEFAULT_MODELS.tts);
	});

	it("gives every asset but a voice nothing to set beside its text", () => {
		for (const type of [
			"asset_avatar",
			"asset_style",
			"asset_references",
		] as const)
			expect(attributeSchemaFor(type, {}).keys).toEqual([]);
	});

	it("keeps what an asset holds outside its schema when it is created", () => {
		expect(
			flatAttributes(
				asset("asset_voice", {
					name: "Mia",
					attrs: { voiceId: "v1", gender: "feminine" },
				}),
			),
		).toEqual({
			name: "Mia",
			...DEFAULT_MODELS.tts,
			voiceId: "v1",
			gender: "feminine",
		});
	});
});

describe("elementModelPick", () => {
	it("picks an avatar's model from the image models", () => {
		expect(elementModelPick(asset("asset_avatar", { name: "Mia" })).type).toBe(
			"image",
		);
	});

	it("picks the element's own pair from its connector type's models", () => {
		expect(elementModelPick(element("narration"))).toEqual({
			kind: "model",
			type: "tts",
			key: "model",
			providerAttr: "provider",
		});
	});
});
