import { describe, expect, it } from "vitest";
import { osmlPlugin } from "@/lib/connectors/llm/plugins/osml";

const { beforeGenerate } = osmlPlugin;
if (!beforeGenerate) throw new Error("osmlPlugin.beforeGenerate is required");

describe("osmlPlugin", () => {
	it("injects systemPrompt when none provided", () => {
		const result = beforeGenerate({ prompt: "hello" });
		expect(result).toHaveProperty("systemPrompt");
		expect((result as { systemPrompt: string }).systemPrompt).toBeTruthy();
	});

	it("preserves existing systemPrompt", () => {
		const result = beforeGenerate({ prompt: "hello", systemPrompt: "custom" });
		expect((result as { systemPrompt: string }).systemPrompt).toBe("custom");
	});

	it("pins the no-all-caps TTS rule (single source for script and story modes)", () => {
		const result = beforeGenerate({ prompt: "hello" });
		expect((result as { systemPrompt: string }).systemPrompt).toContain(
			"ALL CAPS",
		);
	});

	it("writes spoken text in the user's language while pinning descriptions to English", () => {
		const { systemPrompt } = beforeGenerate({ prompt: "hello" }) as {
			systemPrompt: string;
		};
		expect(systemPrompt).toContain("the language of the user's own topic");
		expect(systemPrompt).toMatch(/descriptions in English/);
	});

	it("names English as the fallback rather than ruling any language out", () => {
		const { systemPrompt } = beforeGenerate({ prompt: "hello" }) as {
			systemPrompt: string;
		};
		expect(systemPrompt).toContain("or English when that is unclear");
		expect(systemPrompt).not.toMatch(
			/ignoring the language of|not the language of/,
		);
	});

	it("pins the script to the project language", () => {
		const state = { metadata: { language: "fr" } } as never;
		const { systemPrompt } = beforeGenerate({ prompt: "hello" }, { state }) as {
			systemPrompt: string;
		};
		expect(systemPrompt).toContain("dialogue in fr (ISO 639-1)");
		expect(systemPrompt).not.toContain("the language of the user's own topic");
	});

	it("asks the script to report its language, the only voice signal auto mode has", () => {
		const { systemPrompt } = beforeGenerate({ prompt: "hello" }) as {
			systemPrompt: string;
		};
		expect(systemPrompt).toContain("- language: ISO 639-1 code");
	});

	it("derives the voice language attribute from the script rather than defaulting to English", () => {
		const { systemPrompt } = beforeGenerate({ prompt: "hello" }) as {
			systemPrompt: string;
		};
		expect(systemPrompt).not.toContain('Default to "en"');
	});

	it("ties each image to the moment its narration describes without dropping the standalone-prompt rule", () => {
		const { systemPrompt } = beforeGenerate({ prompt: "hello" }) as {
			systemPrompt: string;
		};
		expect(systemPrompt).toContain(
			"depict the specific moment described by the narration and dialogue that follow it",
		);
		expect(systemPrompt).toContain("must be written as a standalone prompt");
		expect(systemPrompt).toContain(
			"Reference characters by their names in the image description",
		);
	});

	it("deters motion on animated_image, which competes with the videoPrompt animation", () => {
		const { systemPrompt } = beforeGenerate({ prompt: "hello" }) as {
			systemPrompt: string;
		};
		expect(systemPrompt).toMatch(/motion: normally set to "none"/);
		expect(systemPrompt).not.toMatch(/<animated_image[^>]*\smotion=/);
	});
});
