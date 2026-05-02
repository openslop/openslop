import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/asset-bundle");

const mockConvert = vi.fn();

vi.mock("@elevenlabs/elevenlabs-js", () => ({
	ElevenLabsClient: class {
		textToSoundEffects = { convert: mockConvert };
	},
}));

import { ElevenLabsSFX } from "../sfx/elevenlabs";

function mockReadableStream(data: Uint8Array) {
	return new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(data);
			controller.close();
		},
	});
}

describe("ElevenLabsSFX", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("generates sfx and uploads to blob storage", async () => {
		const audio = new Uint8Array([5, 6, 7]);
		mockConvert.mockResolvedValue(mockReadableStream(audio));

		const provider = new ElevenLabsSFX("test-key");
		const result = await provider.generate({ prompt: "boom" });

		expect(result.result.audio).toBe("url");
		expect(result.metadata?.durationSec).toBe(5);
		expect(mockConvert).toHaveBeenCalledWith({
			text: "boom",
			durationSeconds: 5,
			outputFormat: "mp3_22050_32",
		});
	});

	it("passes custom duration", async () => {
		mockConvert.mockResolvedValue(mockReadableStream(new Uint8Array([0])));

		const provider = new ElevenLabsSFX("test-key");
		await provider.generate({ prompt: "crash", durationSeconds: 10 });

		expect(mockConvert).toHaveBeenCalledWith(
			expect.objectContaining({ durationSeconds: 10 }),
		);
	});
});
