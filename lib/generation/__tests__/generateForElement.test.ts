import { describe, expect, it, vi, beforeEach } from "vitest";
import type { AssetResult, PluginContext } from "@/lib/connectors/types";
import { DEFAULT_MODELS } from "@/lib/connectors/models";

const mockGenerate =
	vi.fn<(params: unknown, context: PluginContext) => Promise<AssetResult>>();

vi.mock("@/lib/connectors/factory", async (importOriginal) => ({
	...(await importOriginal<typeof import("@/lib/connectors/factory")>()),
	createConnector: vi.fn(() => ({ generate: mockGenerate })),
}));

import { generateForElement } from "../generateForElement";
import { createConnector } from "@/lib/connectors/factory";
import { jobNode } from "./_graph";

const node = jobNode("a sunset", [], {
	attributes: { width: "1024" },
	reads: { "the art style": "noir" },
});

describe("generateForElement", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("generates on the job's connector with the node's inputs, dependency results and signal", async () => {
		const expected: AssetResult = { imageUrl: "img.png", durationSec: 0 };
		mockGenerate.mockResolvedValue(expected);
		const dependencies = {
			previousVisual: { imageUrl: "frame.png", durationSec: 0 },
		};
		const { signal } = new AbortController();

		const result = await generateForElement(node, dependencies, signal);

		expect(createConnector).toHaveBeenCalledWith(
			"image",
			DEFAULT_MODELS.image,
			{},
		);
		expect(mockGenerate).toHaveBeenCalledWith(
			{ prompt: "a sunset", width: "1024" },
			{ dependencies, reads: { "the art style": "noir" }, signal },
		);
		expect(result).toBe(expected);
	});

	it("propagates errors from connector.generate", async () => {
		mockGenerate.mockRejectedValue(new Error("generation failed"));

		await expect(generateForElement(node, {})).rejects.toThrow(
			"generation failed",
		);
	});
});
