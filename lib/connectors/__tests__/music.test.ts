import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenSlopMusic } from "../music/openslop";
import type { AssetResult, ConnectorPlugin } from "../types";

const TEST_ID = "test-id";
const BUNDLE_URL = `/assets/music/openslop/${TEST_ID}`;
const AUDIO_URL = `${BUNDLE_URL}/output.mp3`;

function jsonResponse(data: unknown) {
	return new Response(JSON.stringify(data), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
}

function mockFetchChain() {
	vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
		jsonResponse({
			id: TEST_ID,
			provider: "openslop",
			result: { audio: "output.mp3" },
		}),
	);
}

describe("BaseMusicConnector", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("runs transformPrompt plugin", async () => {
		mockFetchChain();
		const plugin: ConnectorPlugin = {
			name: "transform",
			transformPrompt: (p) => `epic: ${p}`,
		};
		const connector = new OpenSlopMusic({
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
			apiKey: "",
			plugins: [plugin],
		});
		const result = await connector.generate({ prompt: "rock song" });
		expect(result).toEqual({ url: AUDIO_URL, durationSec: 0 });
	});

	it("runs afterGenerate plugin", async () => {
		mockFetchChain();
		const replacement: AssetResult = {
			url: "https://example.com/replaced.mp3",
			durationSec: 0,
		};
		const plugin: ConnectorPlugin = {
			name: "after",
			afterGenerate: () => replacement,
		};
		const connector = new OpenSlopMusic({
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
			apiKey: "",
			plugins: [plugin],
		});
		const result = await connector.generate({ prompt: "test" });
		expect(result.url).toBe("https://example.com/replaced.mp3");
	});

	it("runs onError plugin on failure", async () => {
		vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("music failed"));
		const errors: string[] = [];

		const connector = new OpenSlopMusic({
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
			apiKey: "",
			plugins: [{ name: "err", onError: (e) => void errors.push(e) }],
		});

		await expect(connector.generate({ prompt: "test" })).rejects.toThrow();
		expect(errors[0]).toContain("music failed");
	});
});
