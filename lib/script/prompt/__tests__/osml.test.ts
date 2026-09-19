import { describe, expect, it } from "vitest";
import { INPUT_LANGUAGE } from "../language";
import { osmlSpec } from "../osml";

const spec = osmlSpec(INPUT_LANGUAGE);

describe("osmlSpec", () => {
	it("pins the no-all-caps TTS rule", () => {
		expect(spec).toContain("ALL CAPS");
	});

	it("writes spoken text in the user's language while pinning prompts to English", () => {
		expect(spec).toContain("the language of the user's own topic");
		expect(spec).toMatch(/prompts in English/);
	});

	it("names English as the fallback rather than ruling any language out", () => {
		expect(spec).toContain("or English when that is unclear");
		expect(spec).not.toMatch(/ignoring the language of|not the language of/);
	});

	it("pins the script to the project language when one is declared", () => {
		const declared = osmlSpec("fr (ISO 639-1)");
		expect(declared).toContain("The script language is fr (ISO 639-1)");
		expect(declared).not.toContain("the language of the user's own topic");
	});

	it("asks the script to report its language, the only voice signal auto mode has", () => {
		expect(spec).toContain("- language: ISO 639-1 code");
		expect(spec).not.toContain('Default to "en"');
	});

	it("ties each image to the moment its narration describes without dropping the standalone-prompt rule", () => {
		expect(spec).toContain(
			"Depict the specific moment described by the narration and dialogue that follow it",
		);
		expect(spec).toContain("<image> prompt must stand alone");
		expect(spec).toContain(
			"Reference characters by their names in the image prompt",
		);
	});

	it("sets the visual cadence without dictating what the script opens with", () => {
		expect(spec).toContain(
			"a new visual (image or video) at least once before every sentence",
		);
		expect(spec).not.toContain("Start with a visual");
	});

	it("asks for dead simple dialogue that fits the scene", () => {
		expect(spec).toContain("Keep dialogue dead simple");
		expect(spec).toContain("make sense for who says it and what just happened");
	});

	it("keeps places and subjects out of the art style, which leads every prompt", () => {
		expect(spec).toContain(
			"Never a place, a setting, a subject or a time of day",
		);
	});

	it("describes every video prompt in detail, standing alone", () => {
		expect(spec).toContain("Each video prompt is standalone");
	});

	it("mixes videos that start fresh with videos that continue the one before", () => {
		expect(spec).toContain('startFrame="none" starts each video fresh');
		expect(spec).toContain("Use both appropriately");
	});

	it("carries the look of the visual before a video unless it moves somewhere new", () => {
		expect(spec).toContain('continuity="true" (the default)');
		expect(spec).toContain(
			'continuity="false" when the video moves somewhere new',
		);
	});

	it("opens a continued video where the one before it ends", () => {
		expect(spec).toContain("starts where that video's last shot ends");
	});

	it("keeps a film to videos and music, whatever the other element rules say", () => {
		expect(spec).toContain(
			"Film: the picture tells the story. Only <video> and <music>.",
		);
		expect(spec).toContain("Use no others.");
	});

	it("deters motion on video, which competes with the motion the video model generates", () => {
		expect(spec).toMatch(/motion: normally set to "none"/);
		expect(spec).not.toMatch(/<video[^>]*\smotion=/);
	});
});
