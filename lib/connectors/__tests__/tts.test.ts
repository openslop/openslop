import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenSlopTTS } from "../tts/openslop";
import type { ConnectorPlugin } from "../types";

const TEST_ID = "test-id";
const BUNDLE_URL = `/assets/tts/openslop/${TEST_ID}`;
const AUDIO_URL = `${BUNDLE_URL}/output.wav`;

function jsonResponse(data: unknown) {
	return new Response(JSON.stringify(data), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
}

function mockFetchChain() {
	vi.spyOn(globalThis, "fetch")
		.mockResolvedValueOnce(
			jsonResponse({
				id: TEST_ID,
				provider: "openslop",
				result: { audio: "output.wav", timestamps: "timestamps.json" },
			}),
		)
		.mockResolvedValueOnce(
			jsonResponse([{ text: "hello", start: 0, end: 0.5 }]),
		);
}

describe("BaseTTSConnector", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("generates TTS via provider with voiceId", async () => {
		mockFetchChain();
		const connector = new OpenSlopTTS({
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
			apiKey: "",
		});
		const result = await connector.generate({
			prompt: "hello",
			voiceId: "default",
		});
		expect(result.url).toBe(AUDIO_URL);
		expect(result.textTimestamps).toHaveLength(1);
	});

	it("resolves voice from attributes when no voiceId", async () => {
		mockFetchChain();
		const connector = new OpenSlopTTS({
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
			apiKey: "",
		});
		vi.spyOn(connector, "searchVoices").mockResolvedValue([
			{ id: "voice-42", name: "Test Voice" },
		]);

		const result = await connector.generate({
			prompt: "hello",
			gender: "male",
			accent: "american",
		});

		expect(connector.searchVoices).toHaveBeenCalledWith({
			query: undefined,
			gender: "male",
			accent: "american",
			language: undefined,
		});
		expect(result.url).toBe(AUDIO_URL);
	});

	it("throws when no matching voice found", async () => {
		const connector = new OpenSlopTTS({
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
			apiKey: "",
		});
		vi.spyOn(connector, "searchVoices").mockResolvedValue([]);

		await expect(
			connector.generate({ prompt: "hello", gender: "alien" }),
		).rejects.toThrow("No matching voice found");
	});

	it("runs transformPrompt on prompt field", async () => {
		mockFetchChain();
		const plugin: ConnectorPlugin = {
			name: "transform",
			transformPrompt: (p) => p.toUpperCase(),
		};
		const connector = new OpenSlopTTS({
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
			apiKey: "",
			plugins: [plugin],
		});
		const result = await connector.generate({
			prompt: "hello",
			voiceId: "default",
		});
		expect(result.url).toBe(AUDIO_URL);
	});

	it("runs onError plugin on failure", async () => {
		vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("tts failed"));
		const errors: string[] = [];

		const connector = new OpenSlopTTS({
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
			apiKey: "",
			plugins: [
				{ name: "err", onError: (e: Error) => void errors.push(e.message) },
			],
		});

		await expect(
			connector.generate({ prompt: "hi", voiceId: "v" }),
		).rejects.toThrow();
		expect(errors).toEqual(["tts failed"]);
	});
});
