import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/providers/image/runware", () => ({ RunwareImage: vi.fn() }));
vi.mock("@/lib/providers/image/mock", () => ({ MockImage: vi.fn() }));
vi.mock("@/lib/providers/video/runware", () => ({ RunwareVideo: vi.fn() }));
vi.mock("@/lib/providers/video/mock", () => ({ MockVideo: vi.fn() }));
vi.mock("@/lib/providers/music/elevenlabs", () => ({
	ElevenLabsMusic: vi.fn(),
}));
vi.mock("@/lib/providers/music/mock", () => ({ MockMusic: vi.fn() }));
vi.mock("@/lib/providers/sfx/elevenlabs", () => ({ ElevenLabsSFX: vi.fn() }));
vi.mock("@/lib/providers/sfx/mock", () => ({ MockSFX: vi.fn() }));
vi.mock("@/lib/providers/llm/anthropic", () => ({ AnthropicLLM: vi.fn() }));
vi.mock("@/lib/providers/llm/mock", () => ({ MockLLM: vi.fn() }));
vi.mock("@/lib/providers/tts/cartesia", () => ({ CartesiaTTS: vi.fn() }));
vi.mock("@/lib/providers/tts/mock", () => ({ MockTTS: vi.fn() }));

import { MockImage } from "@/lib/providers/image/mock";
import { MockVideo } from "@/lib/providers/video/mock";
import { MockMusic } from "@/lib/providers/music/mock";
import { MockSFX } from "@/lib/providers/sfx/mock";
import { MockLLM } from "@/lib/providers/llm/mock";
import { MockTTS } from "@/lib/providers/tts/mock";
import { hostedProviderFor } from "../providers/openslop";

describe("hostedProviderFor", () => {
	const originalEnv = process.env;

	afterEach(() => {
		process.env = originalEnv;
	});

	it("returns MockImage/MockVideo when RUNWARE_API_KEY is missing", () => {
		process.env = { ...originalEnv };
		delete process.env.RUNWARE_API_KEY;

		expect(hostedProviderFor("image", "Slop Image v1")).toBeInstanceOf(
			MockImage,
		);
		expect(hostedProviderFor("video", "Slop Video v1")).toBeInstanceOf(
			MockVideo,
		);
	});

	it("returns MockMusic/MockSFX when ELEVENLABS_API_KEY is missing", () => {
		process.env = { ...originalEnv };
		delete process.env.ELEVENLABS_API_KEY;

		expect(hostedProviderFor("music", "Slop Music v1")).toBeInstanceOf(
			MockMusic,
		);
		expect(hostedProviderFor("sfx", "Slop SFX v1")).toBeInstanceOf(MockSFX);
	});

	it("returns MockLLM when ANTHROPIC_API_KEY is missing", () => {
		process.env = { ...originalEnv };
		delete process.env.ANTHROPIC_API_KEY;

		expect(hostedProviderFor("llm", "Slop LLM v1")).toBeInstanceOf(MockLLM);
	});

	it("returns MockTTS when CARTESIA_API_KEY is missing", () => {
		process.env = { ...originalEnv };
		delete process.env.CARTESIA_API_KEY;

		expect(hostedProviderFor("tts", "Slop TTS v1")).toBeInstanceOf(MockTTS);
	});

	it("builds each hosted model once", () => {
		expect(hostedProviderFor("tts", "Slop TTS v1")).toBe(
			hostedProviderFor("tts", "Slop TTS v1"),
		);
	});

	it("throws for a model OpenSlop does not host", () => {
		expect(() => hostedProviderFor("image", "Seedream 5 Lite")).toThrow(
			'OpenSlop hosts no image model "Seedream 5 Lite"',
		);
	});
});
