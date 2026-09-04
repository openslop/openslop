import { MetadataSchema } from "@/lib/project/types";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type {
	AssetConnectorType,
	AssetResult,
	ConnectorConfig,
} from "@/lib/connectors/types";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import type { GenerationInputs } from "../inputs";
import type { GenerationJob } from "../graph";

const mockGenerate = vi.fn<() => Promise<AssetResult>>();

vi.mock("@/lib/connectors/factory", () => ({
	createConnector: vi.fn(() => ({
		generate: mockGenerate,
	})),
}));

import { generateForElement } from "../generateForElement";
import { createConnector } from "@/lib/connectors/factory";

const EMPTY_STATE = {
	hydrated: true,
	metadata: MetadataSchema.parse({}),
	referenceImages: [],
};

const config: ConnectorConfig = {};

function makeJob(connectorType: AssetConnectorType): GenerationJob {
	return {
		elementId: "el-1",
		elementType: "image",
		connectorType,
		model: DEFAULT_MODELS[connectorType],
		config,
		state: EMPTY_STATE,
	};
}

const inputs = (
	prompt: string,
	attributes: Record<string, string> = {},
): GenerationInputs => ({ prompt, attributes, dependencies: {} });

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
			{},
		);

		expect(createConnector).toHaveBeenCalledWith(
			"image",
			DEFAULT_MODELS.image,
			config,
		);
		expect(mockGenerate).toHaveBeenCalledWith(
			{ prompt: "a sunset", width: "1024" },
			{ elementId: "el-1", dependencies: {}, state: EMPTY_STATE },
		);
		expect(result).toEqual(expected);
	});

	// The connector is built for the job's model and stamps it itself.
	it("builds the connector for the job's model", async () => {
		mockGenerate.mockResolvedValue({ audioUrl: "x", durationSec: 0 });

		await generateForElement(makeJob("music"), inputs("jazz beat"), {});

		expect(createConnector).toHaveBeenCalledWith(
			"music",
			DEFAULT_MODELS.music,
			config,
		);
		expect(mockGenerate).toHaveBeenCalledWith(
			{ prompt: "jazz beat" },
			{ elementId: "el-1", dependencies: {}, state: EMPTY_STATE },
		);
	});

	it("merges attributes into generate call", async () => {
		mockGenerate.mockResolvedValue({ audioUrl: "x", durationSec: 5 });

		await generateForElement(
			makeJob("tts"),
			inputs("hello world", { voiceId: "voice-1", speed: "fast" }),
			{},
		);

		expect(mockGenerate).toHaveBeenCalledWith(
			{ prompt: "hello world", voiceId: "voice-1", speed: "fast" },
			{ elementId: "el-1", dependencies: {}, state: EMPTY_STATE },
		);
	});

	it("forwards dependency results to the connector", async () => {
		mockGenerate.mockResolvedValue({ imageUrl: "x", durationSec: 0 });
		const dependencies = {
			"el-1:still": {
				imageUrl: "https://example.com/still.png",
				durationSec: 0,
			},
		};

		await generateForElement(
			makeJob("animated_image"),
			inputs("a sunset", { videoPrompt: "pan" }),
			dependencies,
		);

		expect(mockGenerate).toHaveBeenCalledWith(expect.anything(), {
			elementId: "el-1",
			dependencies,
			state: EMPTY_STATE,
		});
	});

	it("propagates errors from connector.generate", async () => {
		mockGenerate.mockRejectedValue(new Error("generation failed"));

		await expect(
			generateForElement(makeJob("image"), inputs("test"), {}),
		).rejects.toThrow("generation failed");
	});
});
