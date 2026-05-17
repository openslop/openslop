import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenSlopTTS } from "../tts/openslop";
import { createVoiceSearchPlugin } from "../plugins/voice-search";
import type { ConnectorPlugin } from "../types";
import { mockGatewaySequence } from "./_gateway-mock";

const TEST_ID = "test-id";
const AUDIO_URL = `/assets/tts/openslop/${TEST_ID}/output.wav`;

const config = {
	defaultModel: "test-model",
	models: ["test-model"],
	isDefault: true,
	apiKey: "",
};

function mockSuccess() {
	mockGatewaySequence([
		{ submitStatus: "pending" },
		{
			pollStatus: "completed",
			result: {
				id: TEST_ID,
				provider: "openslop",
				result: { audio: "output.wav", timestamps: "timestamps.json" },
			},
		},
		{ payload: [{ text: "hello", start: 0, end: 0.5 }] },
	]);
}

describe("BaseTTSConnector", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("generates TTS via provider with voiceId", async () => {
		mockSuccess();
		const result = await new OpenSlopTTS(config).generate({
			prompt: "hello",
			voiceId: "default",
		});
		expect(result.url).toBe(AUDIO_URL);
		expect(result.textTimestamps).toHaveLength(1);
	});

	it("resolves voice via voice-search plugin when no voiceId", async () => {
		mockSuccess();
		const connector = new OpenSlopTTS({
			...config,
			plugins: [createVoiceSearchPlugin()],
		});
		vi.spyOn(connector, "searchVoices").mockResolvedValue([
			{ id: "voice-42", name: "Test Voice", description: "" },
		]);

		const result = await connector.generate({
			prompt: "hello",
			gender: "masculine",
			accent: "american",
		});

		expect(connector.searchVoices).toHaveBeenCalledWith({
			query: undefined,
			gender: "masculine",
			age: undefined,
			pitch: undefined,
			accent: "american",
			description: undefined,
			language: "en",
		});
		expect(result.url).toBe(AUDIO_URL);
	});

	it("throws when no matching voice found via voice-search plugin", async () => {
		const connector = new OpenSlopTTS({
			...config,
			plugins: [createVoiceSearchPlugin()],
		});
		vi.spyOn(connector, "searchVoices").mockResolvedValue([]);

		await expect(
			connector.generate({ prompt: "hello", gender: "masculine" }),
		).rejects.toThrow("No matching voice found");
	});

	it("runs transformPrompt on prompt field", async () => {
		mockSuccess();
		const plugin: ConnectorPlugin = {
			name: "transform",
			transformPrompt: (p) => p.toUpperCase(),
		};
		const result = await new OpenSlopTTS({
			...config,
			plugins: [plugin],
		}).generate({ prompt: "hello", voiceId: "default" });
		expect(result.url).toBe(AUDIO_URL);
	});

	it("runs onError plugin on failure", async () => {
		vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("tts failed"));
		const errors: string[] = [];
		const connector = new OpenSlopTTS({
			...config,
			plugins: [{ name: "err", onError: (e) => void errors.push(e) }],
		});

		await expect(
			connector.generate({ prompt: "hi", voiceId: "v" }),
		).rejects.toThrow();
		expect(errors[0]).toContain("tts failed");
	});
});
