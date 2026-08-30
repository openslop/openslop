import { MetadataSchema } from "@/lib/project/types";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type {
	AssetConnectorType,
	AssetResult,
	ConnectorConfig,
} from "@/lib/connectors/types";
import { MODEL_CATALOGS } from "@/lib/connectors/models";
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

const config: ConnectorConfig = {
	isDefault: true,
};

function makeJob(connectorType: AssetConnectorType): GenerationJob {
	return {
		elementId: "el-1",
		elementType: "image",
		connectorType,
		provider: "openslop",
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

		expect(createConnector).toHaveBeenCalledWith("image", "openslop", config);
		expect(mockGenerate).toHaveBeenCalledWith(
			{
				prompt: "a sunset",
				model: MODEL_CATALOGS.image.defaultModel,
				width: "1024",
			},
			{ elementId: "el-1", dependencies: {}, state: EMPTY_STATE },
		);
		expect(result).toEqual(expected);
	});

	it("falls back to the connector type's default model", async () => {
		mockGenerate.mockResolvedValue({ audioUrl: "x", durationSec: 0 });

		await generateForElement(makeJob("music"), inputs("jazz beat"), {});

		expect(mockGenerate).toHaveBeenCalledWith(
			{
				prompt: "jazz beat",
				model: MODEL_CATALOGS.music.defaultModel,
			},
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
			{
				prompt: "hello world",
				model: MODEL_CATALOGS.tts.defaultModel,
				voiceId: "voice-1",
				speed: "fast",
			},
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
