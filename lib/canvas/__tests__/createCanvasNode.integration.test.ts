import { describe, expect, it } from "vitest";
import { createCanvasNode } from "../createCanvasNode";
import { DEFAULT_SFX_MODEL } from "@/lib/connectors/sfx/models";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
import { DEFAULT_VIDEO_MODEL } from "@/lib/connectors/video/models";
import { flatAttributes } from "@/lib/video/elementAttributes";

describe("createCanvasNode — schema defaults (integration)", () => {
	it("applies full TTS defaults for narration", () => {
		const node = createCanvasNode("narration");
		expect(flatAttributes(node)).toMatchObject({
			emotion: "neutral",
			speed: "medium",
			volume: "10",
			...DEFAULT_TTS_MODEL,
		});
	});

	it("applies the same TTS defaults for character", () => {
		const node = createCanvasNode("character");
		expect(flatAttributes(node)).toMatchObject({
			emotion: "neutral",
			speed: "medium",
			volume: "10",
			...DEFAULT_TTS_MODEL,
		});
	});

	it("applies sfx defaults for sound", () => {
		const node = createCanvasNode("sound");
		expect(flatAttributes(node)).toMatchObject({
			loops: "1",
			volume: "2",
			...DEFAULT_SFX_MODEL,
		});
	});

	it("applies clip defaults, leaving the start frame open", () => {
		const node = createCanvasNode("clip");
		const attributes = flatAttributes(node);
		expect(attributes).toMatchObject({
			duration: "10",
			trimToDialogue: "true",
			motion: "none",
			...DEFAULT_VIDEO_MODEL,
		});
		expect(attributes).not.toHaveProperty("startFrame");
	});
});
