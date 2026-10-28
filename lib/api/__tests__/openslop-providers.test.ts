import { describe, expect, it, vi } from "vitest";

const classes = vi.hoisted(() => ({
	RunwareImage: vi.fn(),
	MockImage: vi.fn(),
	RunwareVideo: vi.fn(),
	MockVideo: vi.fn(),
	ElevenLabsMusic: vi.fn(),
	MockMusic: vi.fn(),
	ElevenLabsSFX: vi.fn(),
	MockSFX: vi.fn(),
	AnthropicLLM: vi.fn(),
	MockLLM: vi.fn(),
	CartesiaTTS: vi.fn(),
	MockTTS: vi.fn(),
}));

vi.mock("@/lib/providers/image/runware", () => ({
	RunwareImage: classes.RunwareImage,
}));
vi.mock("@/lib/providers/image/mock", () => ({ MockImage: classes.MockImage }));
vi.mock("@/lib/providers/video/runware", () => ({
	RunwareVideo: classes.RunwareVideo,
}));
vi.mock("@/lib/providers/video/mock", () => ({ MockVideo: classes.MockVideo }));
vi.mock("@/lib/providers/music/elevenlabs", () => ({
	ElevenLabsMusic: classes.ElevenLabsMusic,
}));
vi.mock("@/lib/providers/music/mock", () => ({ MockMusic: classes.MockMusic }));
vi.mock("@/lib/providers/sfx/elevenlabs", () => ({
	ElevenLabsSFX: classes.ElevenLabsSFX,
}));
vi.mock("@/lib/providers/sfx/mock", () => ({ MockSFX: classes.MockSFX }));
vi.mock("@/lib/providers/llm/anthropic", () => ({
	AnthropicLLM: classes.AnthropicLLM,
}));
vi.mock("@/lib/providers/llm/mock", () => ({ MockLLM: classes.MockLLM }));
vi.mock("@/lib/providers/tts/cartesia", () => ({
	CartesiaTTS: classes.CartesiaTTS,
}));
vi.mock("@/lib/providers/tts/mock", () => ({ MockTTS: classes.MockTTS }));

/** The hosted table caches each provider for the life of its module, so every case loads a fresh one. */
async function loadHostedProviderFor() {
	vi.resetModules();
	return (await import("../providers/openslop")).hostedProviderFor;
}

const HOSTED = [
	{
		type: "image",
		model: "Slop Image v2",
		envVar: "RUNWARE_API_KEY",
		real: "RunwareImage",
		mock: "MockImage",
	},
	{
		type: "video",
		model: "Slop Video v2",
		envVar: "RUNWARE_API_KEY",
		real: "RunwareVideo",
		mock: "MockVideo",
	},
	{
		type: "music",
		model: "Slop Music v1",
		envVar: "ELEVENLABS_API_KEY",
		real: "ElevenLabsMusic",
		mock: "MockMusic",
	},
	{
		type: "sfx",
		model: "Slop SFX v1",
		envVar: "ELEVENLABS_API_KEY",
		real: "ElevenLabsSFX",
		mock: "MockSFX",
	},
	{
		type: "llm",
		model: "Slop LLM v1",
		envVar: "ANTHROPIC_API_KEY",
		real: "AnthropicLLM",
		mock: "MockLLM",
	},
	{
		type: "tts",
		model: "Slop TTS v1",
		envVar: "CARTESIA_API_KEY",
		real: "CartesiaTTS",
		mock: "MockTTS",
	},
] as const;

describe("hostedProviderFor", () => {
	describe.each(HOSTED)(
		"$type $model",
		({ type, model, envVar, real, mock }) => {
			it(`builds ${real} with ${envVar}`, async () => {
				vi.stubEnv(envVar, "secret");
				const hostedProviderFor = await loadHostedProviderFor();

				expect(hostedProviderFor(type, model)).toBeInstanceOf(classes[real]);
				expect(classes[real]).toHaveBeenCalledWith("secret");
			});

			it(`falls back to ${mock} without ${envVar}`, async () => {
				vi.stubEnv(envVar, undefined);
				const hostedProviderFor = await loadHostedProviderFor();

				expect(hostedProviderFor(type, model)).toBeInstanceOf(classes[mock]);
				expect(classes[real]).not.toHaveBeenCalled();
			});
		},
	);

	it("builds each hosted model once", async () => {
		const hostedProviderFor = await loadHostedProviderFor();

		expect(hostedProviderFor("tts", "Slop TTS v1")).toBe(
			hostedProviderFor("tts", "Slop TTS v1"),
		);
	});

	it("throws for a model OpenSlop does not host", async () => {
		const hostedProviderFor = await loadHostedProviderFor();

		expect(() => hostedProviderFor("image", "Seedream 5 Lite")).toThrow(
			'OpenSlop hosts no image model "Seedream 5 Lite"',
		);
	});
});
