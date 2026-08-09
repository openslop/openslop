import { describe, expect, it } from "vitest";
import { createRefinePlugin } from "@/lib/connectors/llm/plugins/refine";

async function systemPromptOf(osml: string): Promise<string> {
	const { beforeGenerate } = createRefinePlugin(osml);
	if (!beforeGenerate)
		throw new Error("refinePlugin.beforeGenerate is required");
	const { systemPrompt } = await beforeGenerate({ prompt: "make it funnier" });
	if (!systemPrompt) throw new Error("refinePlugin must set a systemPrompt");
	return systemPrompt;
}

describe("createRefinePlugin", () => {
	it("keeps edits in the script's language even when the request is in another one", async () => {
		const systemPrompt = await systemPromptOf("<narration>Bonjour</narration>");
		expect(systemPrompt).toContain(
			"the same language as the script you are editing",
		);
	});

	it("keeps media descriptions in English regardless of the script's language", async () => {
		expect(await systemPromptOf("<narration>Bonjour</narration>")).toMatch(
			/descriptions in English/,
		);
	});
});
