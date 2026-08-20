import { describe, expect, it } from "vitest";
import { INPUT_LANGUAGE } from "../language";
import { osmlSpec } from "../osml";

const spec = osmlSpec(INPUT_LANGUAGE);

describe("osmlSpec", () => {
	it("pins the no-all-caps TTS rule", () => {
		expect(spec).toContain("ALL CAPS");
	});

	it("writes spoken text in the user's language while pinning descriptions to English", () => {
		expect(spec).toContain("the language of the user's own topic");
		expect(spec).toMatch(/descriptions in English/);
	});

	it("names English as the fallback rather than ruling any language out", () => {
		expect(spec).toContain("or English when that is unclear");
		expect(spec).not.toMatch(/ignoring the language of|not the language of/);
	});

	it("pins the script to the project language when one is declared", () => {
		const declared = osmlSpec("fr (ISO 639-1)");
		expect(declared).toContain("dialogue in fr (ISO 639-1)");
		expect(declared).not.toContain("the language of the user's own topic");
	});

	it("asks the script to report its language, the only voice signal auto mode has", () => {
		expect(spec).toContain("- language: ISO 639-1 code");
		expect(spec).not.toContain('Default to "en"');
	});

	it("ties each image to the moment its narration describes without dropping the standalone-prompt rule", () => {
		expect(spec).toContain(
			"depict the specific moment described by the narration and dialogue that follow it",
		);
		expect(spec).toContain("must be written as a standalone prompt");
		expect(spec).toContain(
			"Reference characters by their names in the image description",
		);
	});

	it("deters motion on animated_image, which competes with the videoPrompt animation", () => {
		expect(spec).toMatch(/motion: normally set to "none"/);
		expect(spec).not.toMatch(/<animated_image[^>]*\smotion=/);
	});
});
