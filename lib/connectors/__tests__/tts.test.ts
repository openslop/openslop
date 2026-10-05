import { describe, expect, it, vi, beforeEach } from "vitest";
import { HttpTTSConnector } from "../tts/connector";
import { createSpeakerVoicePlugin } from "@/lib/connectors/tts/plugins/speaker-voice";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { NARRATOR, voiceAttrs } from "@/lib/canvas/assets";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import type { ConnectorPlugin } from "../types";
import { mockGatewaySequence } from "./_gateway-mock";
import { readsOf } from "./_state-ctx";

const TEST_ID = "test-id";
const AUDIO_URL = `/assets/tts/openslop/${TEST_ID}/output.wav`;

const config = {
	model: { provider: "openslop", model: "Slop TTS v1" },
} as const;

const SUCCESS: Parameters<typeof mockGatewaySequence>[0] = [
	{ submitStatus: "pending" },
	{
		pollStatus: "completed",
		result: {
			id: TEST_ID,
			type: "tts",
			provider: "openslop",
			result: { audio: "output.wav", timestamps: "timestamps.json" },
		},
	},
	{ payload: [{ text: "hello", start: 0, end: 0.5 }] },
];

const mockSuccess = () => mockGatewaySequence(SUCCESS);

describe("BaseTTSConnector", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("generates TTS via provider with voiceId", async () => {
		mockSuccess();
		const result = await new HttpTTSConnector(config).generate({
			prompt: "hello",
			voiceId: "default",
		});
		expect(result.audioUrl).toBe(AUDIO_URL);
		expect(result.textTimestamps).toHaveLength(1);
	});

	it("speaks in the voice settled on its speaker's cast, through the speaker-voice plugin", async () => {
		const fetchSpy = mockGatewaySequence(SUCCESS);
		const plugin = createSpeakerVoicePlugin();
		const connector = new HttpTTSConnector({ ...config, plugins: [plugin] });
		const narrator = asset("cast", {
			name: NARRATOR,
			attrs: voiceAttrs({ ...config.model, voiceId: "voice-42" }),
		});
		const reads = readsOf(plugin, createCanvasNode("narration"), [narrator]);

		const result = await connector.generate(
			{ prompt: "hello", gender: "masculine", accent: "american" },
			{ reads },
		);

		expect(result.audioUrl).toBe(AUDIO_URL);
		const submitted = String(fetchSpy.mock.calls[0]?.[1]?.body);
		expect(JSON.parse(submitted)).toMatchObject({ voiceId: "voice-42" });
		expect(submitted).not.toContain("masculine");
	});

	it("runs transformPrompt on prompt field", async () => {
		mockSuccess();
		const plugin: ConnectorPlugin = {
			name: "transform",
			transformPrompt: (p) => p.toUpperCase(),
		};
		const result = await new HttpTTSConnector({
			...config,
			plugins: [plugin],
		}).generate({ prompt: "hello", voiceId: "default" });
		expect(result.audioUrl).toBe(AUDIO_URL);
	});

	it("runs onError plugin on failure", async () => {
		vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("tts failed"));
		const errors: string[] = [];
		const connector = new HttpTTSConnector({
			...config,
			plugins: [{ name: "err", onError: (e) => void errors.push(e) }],
		});

		await expect(
			connector.generate({ prompt: "hi", voiceId: "v" }),
		).rejects.toThrow();
		expect(errors[0]).toContain("tts failed");
	});
});
