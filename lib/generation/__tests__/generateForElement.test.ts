import { describe, expect, it, vi, beforeEach } from "vitest";
import type { CanvasContentElement } from "@/lib/canvas/types";
import type {
	AssetConnectorType,
	AssetResult,
	ConnectorConfig,
} from "@/lib/connectors/types";
import type { GenerationInputs } from "../generationInputs";
import type { GenerationJob } from "../queue";

const mockGenerate = vi.fn<() => Promise<AssetResult>>();

vi.mock("@/lib/connectors/factory", () => ({
	createConnector: vi.fn(() => ({
		generate: mockGenerate,
	})),
}));

import { generateForElement } from "../generateForElement";
import { createConnector } from "@/lib/connectors/factory";

const config: ConnectorConfig = {
	defaultModel: "test-model",
	models: ["test-model"],
	isDefault: true,
};

function makeJob(connectorType: AssetConnectorType): GenerationJob {
	const element: CanvasContentElement = {
		id: "el-1",
		type: "image",
		children: [{ id: "t", type: "image", text: "" }],
	};
	return {
		elementId: "el-1",
		connectorType,
		provider: "openslop",
		config,
		projectId: "test-project",
		element,
	};
}

const inputs = (
	prompt: string,
	attributes: Record<string, string> = {},
): GenerationInputs => ({ prompt, attributes });

describe("generateForElement", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("creates connector and calls generate with correct params", async () => {
		const expected: AssetResult = {
			imageUrl: "https://example.com/img.png",
			durationSec: 0,
		};
		mockGenerate.mockResolvedValue(expected);

		const result = await generateForElement(
			makeJob("image"),
			inputs("a sunset", { width: "1024" }),
		);

		expect(createConnector).toHaveBeenCalledWith("image", "openslop", config);
		expect(mockGenerate).toHaveBeenCalledWith(
			{
				prompt: "a sunset",
				model: "test-model",
				width: "1024",
			},
			undefined,
		);
		expect(result).toEqual(expected);
	});

	it("passes default model from config", async () => {
		mockGenerate.mockResolvedValue({ audioUrl: "x", durationSec: 0 });

		await generateForElement(makeJob("music"), inputs("jazz beat"));

		expect(mockGenerate).toHaveBeenCalledWith(
			{
				prompt: "jazz beat",
				model: "test-model",
			},
			undefined,
		);
	});

	it("merges attributes into generate call", async () => {
		mockGenerate.mockResolvedValue({ audioUrl: "x", durationSec: 5 });

		await generateForElement(
			makeJob("tts"),
			inputs("hello world", { voiceId: "voice-1", speed: "fast" }),
		);

		expect(mockGenerate).toHaveBeenCalledWith(
			{
				prompt: "hello world",
				model: "test-model",
				voiceId: "voice-1",
				speed: "fast",
			},
			undefined,
		);
	});

	it("forwards the prior snapshot to the connector", async () => {
		mockGenerate.mockResolvedValue({ imageUrl: "x", durationSec: 0 });
		const prior = {
			status: "idle" as const,
			seconds: 0,
			result: {
				imageUrl: "https://example.com/prior.png",
				durationSec: 0,
			},
			error: null,
			resultInputs: inputs("a sunset", { videoPrompt: "zoom" }),
			connectorType: "animated_image" as const,
		};

		await generateForElement(
			makeJob("animated_image"),
			inputs("a sunset", { videoPrompt: "pan" }),
			prior,
		);

		expect(mockGenerate).toHaveBeenCalledWith(expect.anything(), prior);
	});

	it("propagates errors from connector.generate", async () => {
		mockGenerate.mockRejectedValue(new Error("generation failed"));

		await expect(
			generateForElement(makeJob("image"), inputs("test")),
		).rejects.toThrow("generation failed");
	});
});
