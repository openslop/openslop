import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenSlopMusic } from "../music/openslop";
import type { AssetResult, ConnectorPlugin } from "../types";
import { mockGatewaySuccess } from "./_gateway-mock";

const TEST_ID = "test-id";
const AUDIO_URL = `/assets/music/openslop/${TEST_ID}/output.mp3`;

const config = {
	defaultModel: "test-model",
	models: ["test-model"],
	isDefault: true,
	apiKey: "",
};

function mockSuccess() {
	mockGatewaySuccess({
		id: TEST_ID,
		provider: "openslop",
		result: { audio: "output.mp3" },
	});
}

describe("BaseMusicConnector", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("runs transformPrompt plugin", async () => {
		mockSuccess();
		const plugin: ConnectorPlugin = {
			name: "transform",
			transformPrompt: (p) => `epic: ${p}`,
		};
		const result = await new OpenSlopMusic({
			...config,
			plugins: [plugin],
		}).generate({ prompt: "rock song" });
		expect(result).toEqual({ audioUrl: AUDIO_URL, durationSec: 0 });
	});

	it("runs afterGenerate plugin", async () => {
		mockSuccess();
		const replacement: AssetResult = {
			audioUrl: "https://example.com/replaced.mp3",
			durationSec: 0,
		};
		const plugin: ConnectorPlugin = {
			name: "after",
			afterGenerate: () => replacement,
		};
		const result = await new OpenSlopMusic({
			...config,
			plugins: [plugin],
		}).generate({ prompt: "test" });
		expect(result.audioUrl).toBe("https://example.com/replaced.mp3");
	});

	it("runs onError plugin on failure", async () => {
		vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("music failed"));
		const errors: string[] = [];
		const connector = new OpenSlopMusic({
			...config,
			plugins: [{ name: "err", onError: (e) => void errors.push(e) }],
		});

		await expect(connector.generate({ prompt: "test" })).rejects.toThrow();
		expect(errors[0]).toContain("music failed");
	});
});
