import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/asset-bundle");

const mockCompose = vi.fn();
const mockConvert = vi.fn();
vi.mock("@elevenlabs/elevenlabs-js", () => ({
	ElevenLabsClient: class {
		music = { compose: mockCompose };
		textToSoundEffects = { convert: mockConvert };
	},
}));

const mockQuery = vi.fn();
const mockUpsert = vi.fn();
vi.mock("@pinecone-database/pinecone", () => ({
	Pinecone: class {
		index = () => ({
			namespace: () => ({ query: mockQuery, upsert: mockUpsert }),
		});
	},
}));

const mockEmbedText = vi.fn();
vi.mock("../embed", () => ({
	embedText: (t: string) => mockEmbedText(t),
}));

async function loadProviders() {
	vi.resetModules();
	process.env.PINECONE_API_KEY = "test-key";
	return {
		music: (await import("../music/elevenlabs")).ElevenLabsMusic,
		sfx: (await import("../sfx/elevenlabs")).ElevenLabsSFX,
	};
}

const MUSIC_MODEL = "music_v1";
const SFX_MODEL = "eleven_text_to_sound_v2";

describe("ElevenLabs providers with pinecone cache enabled", () => {
	beforeEach(() => {
		vi.clearAllMocks();
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

		const { music: ElevenLabsMusic } = await loadProviders();
		const result = await new ElevenLabsMusic("k").generate({
			prompt: "jazz",
			model: MUSIC_MODEL,
		});

		expect(result.result.audio).toBe("https://blob/cached.mp3");
		expect(result.metadata?.cached).toBe(true);
		expect(result.metadata?.durationSec).toBe(30);
		expect(mockCompose).not.toHaveBeenCalled();
		expect(mockEmbedText).toHaveBeenCalledWith("jazz");
	});

	it("music: on miss, runs ElevenLabs and upserts with prompt-only key", async () => {
		mockQuery.mockResolvedValue({ matches: [] });
		mockCompose.mockResolvedValue(
			new ReadableStream<Uint8Array>({
				start(c) {
					c.enqueue(new Uint8Array(16000));
					c.close();
				},
			}),
		);

		const { music: ElevenLabsMusic } = await loadProviders();
		const result = await new ElevenLabsMusic("k").generate({
			prompt: "jazz",
			durationSeconds: 5,
			model: MUSIC_MODEL,
		});

		expect(result.result.audio).toBe("url"); // mocked AssetBundle.upload
		expect(mockCompose).toHaveBeenCalled();
		expect(mockEmbedText).toHaveBeenCalledWith("jazz"); // prompt only — duration excluded
		expect(mockUpsert).toHaveBeenCalledWith({
			records: [
				expect.objectContaining({
					values: [0.1, 0.2],
					metadata: expect.objectContaining({
						url: "/assets/music/elevenlabs/test/url", // resolved via AssetBundle
						description: "jazz",
					}),
				}),
			],
		});
	});

	it("sfx: serialize override embeds prompt only (duration excluded)", async () => {
		mockQuery.mockResolvedValue({ matches: [] });
		mockConvert.mockResolvedValue(
			new ReadableStream<Uint8Array>({
				start(c) {
					c.enqueue(new Uint8Array([0]));
					c.close();
				},
			}),
		);

		const { sfx: ElevenLabsSFX } = await loadProviders();
		await new ElevenLabsSFX("k").generate({
			prompt: "boom",
			durationSeconds: 3,
			model: SFX_MODEL,
		});

		expect(mockEmbedText).toHaveBeenCalledWith("boom");
	});

	it("ignores hits below the default threshold (0.9)", async () => {
		mockQuery.mockResolvedValue({
			matches: [{ score: 0.5, metadata: { url: "stale" } }],
		});
		mockCompose.mockResolvedValue(
			new ReadableStream<Uint8Array>({
				start(c) {
					c.enqueue(new Uint8Array(16000));
					c.close();
				},
			}),
		);

		const { music: ElevenLabsMusic } = await loadProviders();
		const result = await new ElevenLabsMusic("k").generate({
			prompt: "rock",
			model: MUSIC_MODEL,
		});
		expect(result.result.audio).toBe("url"); // fresh, not "stale"
		expect(mockCompose).toHaveBeenCalled();
	});
});
