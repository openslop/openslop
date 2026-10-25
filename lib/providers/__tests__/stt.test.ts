import { afterEach, describe, expect, it, vi } from "vitest";
import { spyAssetBundle } from "./_asset-bundle";

const mockConvert = vi.fn();
const mockTranscribe = vi.fn();

vi.mock("@elevenlabs/elevenlabs-js", () => ({
	ElevenLabsClient: class {
		speechToText = { convert: mockConvert };
	},
}));

vi.mock("@cartesia/cartesia-js", () => ({
	default: class {
		stt = { transcribe: mockTranscribe };
	},
}));

import { CartesiaSTT } from "../stt/cartesia";
import { ElevenLabsSTT } from "../stt/elevenlabs";

const { upload } = spyAssetBundle();
const MEDIA_URL = "https://assets.test/assets/video/clip.mp4";

const uploadedCaptions = () => {
	const [, , [file]] = upload.mock.calls[0];
	if (!("data" in file)) throw new Error("Captions were not written inline");
	return JSON.parse(String(file.data));
};

const caption = (text: string, startMs: number, endMs: number) => ({
	text,
	startMs,
	endMs,
	timestampMs: null,
	confidence: null,
});

afterEach(() => {
	vi.clearAllMocks();
	vi.unstubAllGlobals();
});

describe("ElevenLabsSTT", () => {
	it("keeps only spoken words, without the spacing Scribe times between them", async () => {
		mockConvert.mockResolvedValue({
			audioDurationSecs: 2,
			words: [
				{ text: "Hi", type: "word", start: 0, end: 0.4 },
				{ text: " ", type: "spacing", start: 0.4, end: 0.5 },
				{ text: "there,", type: "word", start: 0.5, end: 1 },
				{ text: "(laughs)", type: "audio_event", start: 1, end: 1.5 },
				{ text: "pal", type: "word", start: 1.5, end: 2 },
			],
		});

		await new ElevenLabsSTT("key").generate({
			prompt: "",
			mediaUrl: MEDIA_URL,
			model: "scribe_v2",
		});

		expect(uploadedCaptions()).toEqual([
			caption("Hi", 0, 400),
			caption("there,", 500, 1000),
			caption("pal", 1500, 2000),
		]);
	});
});

describe("CartesiaSTT", () => {
	it("trims the space Ink leads some words with, and keeps words with none", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("audio")));
		mockTranscribe.mockResolvedValue({
			duration: 1,
			words: [
				{ word: " Hi", start: 0, end: 0.4 },
				{ word: " there", start: 0.5, end: 0.7 },
				{ word: "猫", start: 0.7, end: 0.85 },
				{ word: "は", start: 0.85, end: 1 },
			],
		});

		await new CartesiaSTT("key").generate({
			prompt: "",
			mediaUrl: MEDIA_URL,
			model: "ink-whisper",
		});

		expect(uploadedCaptions()).toEqual([
			caption("Hi", 0, 400),
			caption("there", 500, 700),
			caption("猫", 700, 850),
			caption("は", 850, 1000),
		]);
	});
});
