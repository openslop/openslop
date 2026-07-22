import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenSlopLLM } from "../llm/openslop";
import { OpenSlopMusic } from "../music/openslop";
import { OpenSlopSFX } from "../sfx/openslop";
import { OpenSlopImage } from "../image/openslop";
import { OpenSlopTTS } from "../tts/openslop";
import { OpenSlopVideo } from "../video/openslop";
import { mockGatewaySequence, mockGatewaySuccess } from "./_gateway-mock";

const config = {
	defaultModel: "test-model",
	models: ["test-model"],
	isDefault: true,
	apiKey: "test",
};

function jsonResponse(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "content-type": "application/json" },
	});
}

const TEST_ID = "test-id";

function mockAsset(type: string, result: Record<string, string>) {
	const bundleUrl = `/assets/${type}/openslop/${TEST_ID}`;
	mockGatewaySuccess({ id: TEST_ID, type, provider: "openslop", result });
	return bundleUrl;
}

describe("OpenSlop connectors (via gateways)", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("LLM: generate calls /api/v1/llm", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			jsonResponse({
				text: "Hello",
				model: "test-model",
				usage: { inputTokens: 5, outputTokens: 3 },
			}),
		);

		const c = new OpenSlopLLM(config);
		const result = await c.generate({ prompt: "hello" });

		expect(result.text).toBe("Hello");
		expect(result.model).toBe("test-model");
		expect(fetch).toHaveBeenCalledWith(
			"/api/v1/llm",
			expect.objectContaining({ method: "POST" }),
		);
	});

	it("LLM: stream calls /api/v1/llm with stream=true", async () => {
		const sseData =
			'data: {"text":"Hi","done":false}\n\ndata: {"text":"","done":true}\n\n';
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(sseData, {
				status: 200,
				headers: { "content-type": "text/event-stream" },
			}),
		);

		const c = new OpenSlopLLM(config);
		const chunks: { text: string; done: boolean }[] = [];
		for await (const chunk of c.stream({ prompt: "hi" })) {
			chunks.push(chunk);
		}

		expect(chunks).toEqual([
			{ text: "Hi", done: false },
			{ text: "", done: true },
		]);
	});

	it("Music: generate returns AssetResult with url", async () => {
		const bundleUrl = mockAsset("music", { audio: "output.mp3" });
		const result = await new OpenSlopMusic(config).generate({ prompt: "jazz" });
		expect(result.audioUrl).toBe(`${bundleUrl}/output.mp3`);
	});

	it("SFX: generate returns AssetResult with url", async () => {
		const bundleUrl = mockAsset("sfx", { audio: "output.mp3" });
		const result = await new OpenSlopSFX(config).generate({ prompt: "boom" });
		expect(result.audioUrl).toBe(`${bundleUrl}/output.mp3`);
	});

	it("Image: generate returns AssetResult with url", async () => {
		const bundleUrl = mockAsset("image", { image: "output.png" });
		const result = await new OpenSlopImage(config).generate({
			prompt: "mountain",
		});
		expect(result.imageUrl).toBe(`${bundleUrl}/output.png`);
	});

	it("TTS: generate returns TTSResult with url", async () => {
		const bundleUrl = `/assets/tts/openslop/${TEST_ID}`;
		mockGatewaySequence([
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
		]);

		const result = await new OpenSlopTTS(config).generate({
			prompt: "hello",
			voiceId: "v1",
		});

		expect(result.audioUrl).toBe(`${bundleUrl}/output.wav`);
		expect(result.textTimestamps).toHaveLength(1);
		expect(result.textTimestamps[0].text).toBe("hello");
	});

	it("TTS: searchVoices calls /api/v1/tts/voices", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			jsonResponse({
				voices: [{ id: "v1", name: "Voice 1", language: "en" }],
			}),
		);

		const c = new OpenSlopTTS(config);
		const voices = await c.searchVoices({ query: "test" });

		expect(voices).toHaveLength(1);
		expect(voices[0].id).toBe("v1");
	});

	it("Video: generate returns AssetResult with url", async () => {
		mockAsset("video", { video: "https://cdn.example.com/v.mp4" });
		const result = await new OpenSlopVideo(config).generate({
			prompt: "sunset",
		});
		expect(result.videoUrl).toBe("https://cdn.example.com/v.mp4");
	});
});
