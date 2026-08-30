import { describe, expect, it } from "vitest";
import { createCanvasNode } from "../createCanvasNode";
import { IMAGE_MODELS } from "@/lib/connectors/image/models";
import { SFX_MODELS } from "@/lib/connectors/sfx/models";
import { TTS_MODELS } from "@/lib/connectors/tts/models";
import { VIDEO_MODELS } from "@/lib/connectors/video/models";
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
			model: TTS_MODELS.defaultModel,
		});
	});

	it("applies the same TTS defaults for character", () => {
		const node = createCanvasNode("character");
		expect(flatAttributes(node)).toMatchObject({
			emotion: "neutral",
			speed: "medium",
			volume: "10",
			model: TTS_MODELS.defaultModel,
		});
	});

	it("applies sfx defaults for sound", () => {
		const node = createCanvasNode("sound");
		expect(flatAttributes(node)).toMatchObject({
			loops: "1",
			volume: "2",
			model: SFX_MODELS.defaultModel,
		});
	});

	it("applies animated_image defaults including videoPrompt", () => {
		const node = createCanvasNode("animated_image");
		expect(flatAttributes(node)).toMatchObject({
			videoPrompt: "slow cinematic pan",
			duration: "10",
			motion: "none",
			model: VIDEO_MODELS.defaultModel,
		});
	});

	it("rejects a stillModel the image connector doesn't offer", () => {
		const node = createCanvasNode("animated_image", {
			attrs: { stillModel: VIDEO_MODELS.defaultModel },
		});
		expect(flatAttributes(node).stillModel).toBe(IMAGE_MODELS.defaultModel);
	});
});
