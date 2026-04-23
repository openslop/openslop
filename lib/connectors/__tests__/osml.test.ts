import { describe, expect, it } from "vitest";
import { osmlPlugin } from "../plugins/osml";

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
});
