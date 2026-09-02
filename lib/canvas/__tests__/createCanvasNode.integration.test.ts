import { describe, expect, it } from "vitest";
import { createCanvasNode } from "../createCanvasNode";
import { DEFAULT_IMAGE_MODEL } from "@/lib/connectors/image/models";
import { DEFAULT_SFX_MODEL } from "@/lib/connectors/sfx/models";
import { DEFAULT_VIDEO_MODEL } from "@/lib/connectors/video/models";
import { flatAttributes } from "@/lib/video/elementAttributes";

// The model is a schema default like any other attribute, so the registry's own
// defaultModel does not decide what a new element is created with.
describe("createCanvasNode — schema defaults (integration)", () => {
	it("applies full TTS defaults for narration", () => {
		const node = createCanvasNode("narration");
		expect(flatAttributes(node)).toMatchObject({
			emotion: "neutral",
			speed: "medium",
			volume: "10",
		});
		expect(flatAttributes(node).model).toBeUndefined();
	});

	it("applies the same TTS defaults for character", () => {
		const node = createCanvasNode("character");
		expect(flatAttributes(node)).toMatchObject({
			emotion: "neutral",
			speed: "medium",
			volume: "10",
		});
		expect(flatAttributes(node).model).toBeUndefined();
	});

	it("applies sfx defaults for sound", () => {
		const node = createCanvasNode("sound");
		expect(flatAttributes(node)).toMatchObject({
			loops: "1",
			volume: "2",
			...DEFAULT_SFX_MODEL,
		});
	});

	it("applies animated_image defaults including videoPrompt", () => {
		const node = createCanvasNode("animated_image");
		expect(flatAttributes(node)).toMatchObject({
			videoPrompt: "slow cinematic pan",
			duration: "10",
			motion: "none",
			...DEFAULT_VIDEO_MODEL,
		});
	});

	it("seeds the still with the recommended image model", () => {
		const node = createCanvasNode("animated_image");
		expect(flatAttributes(node)).toMatchObject({
			stillProvider: DEFAULT_IMAGE_MODEL.provider,
			stillModel: DEFAULT_IMAGE_MODEL.model,
		});
	});
});
