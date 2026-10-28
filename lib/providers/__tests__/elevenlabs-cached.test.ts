import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => vi.stubEnv("PINECONE_API_KEY", "test-key"));

/** The providers build their cache at import, so Pinecone's spies must exist before the static imports run. */
const { mockQuery, mockUpsert } = vi.hoisted(() => ({
	mockQuery: vi.fn(),
	mockUpsert: vi.fn(),
}));

const mockCompose = vi.fn();
const mockConvert = vi.fn();
vi.mock("@elevenlabs/elevenlabs-js", () => ({
	ElevenLabsClient: class {
		music = { compose: mockCompose };
		textToSoundEffects = { convert: mockConvert };
	},
}));

vi.mock("@pinecone-database/pinecone", () => ({
	Pinecone: class {
		index = () => ({ query: mockQuery, upsert: mockUpsert });
	},
}));

const mockEmbedText = vi.fn();
vi.mock("../embed", () => ({
	embedText: (t: string) => mockEmbedText(t),
}));

import { ElevenLabsMusic } from "../music/elevenlabs";
import { ElevenLabsSFX } from "../sfx/elevenlabs";
import { spyAssetBundle } from "./_asset-bundle";

const MUSIC_MODEL = "music_v1";
const SFX_MODEL = "eleven_text_to_sound_v2";

describe("ElevenLabs providers with pinecone cache enabled", () => {
	spyAssetBundle();

	beforeEach(() => {
		mockEmbedText.mockResolvedValue([0.1, 0.2]);
		mockUpsert.mockResolvedValue(undefined);
	});

	it("music: serves cache hit without calling ElevenLabs", async () => {
		mockQuery.mockResolvedValue({
			matches: [
				{
					score: 0.99,
					metadata: {
						url: "https://blob/cached.mp3",
						duration: 30,
						description: "jazz",
					},
				},
			],
		});

		const result = await new ElevenLabsMusic("k").generate({
			prompt: "jazz",
			model: MUSIC_MODEL,
		});

		expect(result.output.result.audio).toBe("https://blob/cached.mp3");
		expect(result.output.metadata?.cached).toBe(true);
		expect(result.output.metadata?.durationSec).toBe(30);
		expect(mockCompose).not.toHaveBeenCalled();
		expect(mockEmbedText).toHaveBeenCalledWith("jazz");
	});

	it("music: on miss, runs ElevenLabs and upserts the stored file's url under the prompt", async () => {
		mockQuery.mockResolvedValue({ matches: [] });
		mockCompose.mockResolvedValue(
			new ReadableStream<Uint8Array>({
				start(c) {
					c.enqueue(new Uint8Array(16000));
					c.close();
				},
			}),
		);

		const result = await new ElevenLabsMusic("k").generate({
			prompt: "jazz",
			durationSeconds: 5,
			model: MUSIC_MODEL,
		});

		expect(result.output.result.audio).toBe("output.mp3");
		expect(mockCompose).toHaveBeenCalled();
		expect(mockEmbedText).toHaveBeenCalledWith("jazz");
		expect(mockUpsert).toHaveBeenCalledWith({
			records: [
				expect.objectContaining({
					values: [0.1, 0.2],
					metadata: expect.objectContaining({
						url: "https://assets.test/assets/music/elevenlabs/drawn/output.mp3",
						description: "jazz",
					}),
				}),
			],
		});
	});

	it("sfx: embeds the prompt only (duration excluded)", async () => {
		mockQuery.mockResolvedValue({ matches: [] });
		mockConvert.mockResolvedValue(
			new ReadableStream<Uint8Array>({
				start(c) {
					c.enqueue(new Uint8Array([0]));
					c.close();
				},
			}),
		);

		await new ElevenLabsSFX("k").generate({
			prompt: "boom",
			durationSeconds: 3,
			model: SFX_MODEL,
		});

		expect(mockEmbedText).toHaveBeenCalledWith("boom");
	});
});
