import { describe, expect, it } from "vitest";
import { HttpTTSConnector } from "../tts/connector";
import { createSpeakerVoicePlugin } from "@/lib/connectors/tts/plugins/speaker-voice";
import { mockGatewaySequence } from "./_gateway-mock";
import { toCaption } from "@/lib/captions/word-captions";

const TEST_ID = "test-id";
const AUDIO_URL = `/assets/tts/openslop/${TEST_ID}/output.wav`;

const config = {
	projectId: "project-1",
	model: { provider: "openslop", model: "Sonic 3.6" },
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
	{ payload: [toCaption("hello", 0, 0.5)] },
];

describe("BaseTTSConnector", () => {
	it("speaks in the voice its speaker's voice found, through the speaker-voice plugin", async () => {
		const fetchSpy = mockGatewaySequence(SUCCESS);
		const connector = new HttpTTSConnector({
			...config,
			plugins: [createSpeakerVoicePlugin()],
		});
		const dependencies = {
			"Narrator's voice": { durationSec: 0, voiceId: "voice-42" },
		};

		const result = await connector.generate(
			{ prompt: "hello", name: "Narrator" },
			{ dependencies },
		);

		expect(result.audioUrl).toBe(AUDIO_URL);
		expect(JSON.parse(String(fetchSpy.mock.calls[0]?.[1]?.body))).toMatchObject(
			{ voiceId: "voice-42" },
		);
	});
});
