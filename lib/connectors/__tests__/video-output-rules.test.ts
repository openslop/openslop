import { describe, expect, it } from "vitest";
import type { PluginContext } from "../types";
import { DEFAULT_CONNECTOR_REGISTRY } from "../registry";
import {
	createVideoOutputRulesPlugin,
	VIDEO_OUTPUT_RULES,
} from "../video/plugins/output-rules";

describe("video output rules plugin", () => {
	it("ends the prompt with the output rules", async () => {
		const plugin = createVideoOutputRulesPlugin();
		const prompt = await plugin.transformPrompt?.(
			"Shot 1: A wide shot of a harbour at dawn. Sound: gulls far off. ",
			{} as PluginContext,
		);
		expect(prompt).toBe(
			`Shot 1: A wide shot of a harbour at dawn. Sound: gulls far off. ${VIDEO_OUTPUT_RULES}`,
		);
	});

	it("runs last in the video chain, after the art style is prepended", () => {
		const names = DEFAULT_CONNECTOR_REGISTRY.video.plugins?.map((p) => p.name);
		expect(names?.at(-1)).toBe("video-output-rules");
		expect(names).toContain("art-style");
	});
});
