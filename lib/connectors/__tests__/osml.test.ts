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

	it("deters motion on animated_image, which competes with the videoPrompt animation", () => {
		const { systemPrompt } = beforeGenerate({ prompt: "hello" }) as {
			systemPrompt: string;
		};
		expect(systemPrompt).toMatch(/motion: normally set to "none"/);
		expect(systemPrompt).not.toMatch(/<animated_image[^>]*\smotion=/);
	});
});
