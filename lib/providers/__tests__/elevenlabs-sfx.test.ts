import { describe, expect, it, vi } from "vitest";

const mockConvert = vi.fn();

vi.mock("@elevenlabs/elevenlabs-js", () => ({
	ElevenLabsClient: class {
		textToSoundEffects = { convert: mockConvert };
	},
}));

import { ElevenLabsSFX } from "../sfx/elevenlabs";
import { spyAssetBundle } from "./_asset-bundle";

function mockReadableStream(data: Uint8Array) {
	return new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(data);
			controller.close();
		},
	});
}

const MODEL = "eleven_text_to_sound_v2";

describe("ElevenLabsSFX", () => {
	spyAssetBundle();

	it("omits durationSeconds and computes duration from buffer when no duration provided", async () => {
		// 32000 bytes at 128 kbps CBR mp3 = 2 seconds
		const audio = new Uint8Array(32000);
		mockConvert.mockResolvedValue(mockReadableStream(audio));

		const provider = new ElevenLabsSFX("test-key");
		const result = await provider.generate({ prompt: "boom", model: MODEL });

		expect(result.output.result.audio).toBe("output.mp3");
		expect(result.output.metadata?.durationSec).toBe(2);
		expect(mockConvert).toHaveBeenCalledWith({
			text: "boom",
			durationSeconds: undefined,
			modelId: MODEL,
			outputFormat: "mp3_44100_128",
		});
	});

	it("passes custom duration", async () => {
		mockConvert.mockResolvedValue(mockReadableStream(new Uint8Array([0])));

		const provider = new ElevenLabsSFX("test-key");
		await provider.generate({
			prompt: "crash",
			durationSeconds: 10,
			model: MODEL,
		});

		expect(mockConvert).toHaveBeenCalledWith(
			expect.objectContaining({ durationSeconds: 10, modelId: MODEL }),
		);
	});
});
