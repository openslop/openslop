import { describe, expect, it, vi, afterEach } from "vitest";

vi.mock("@/lib/providers/image/runware", () => ({
	RunwareImage: vi.fn(),
}));
vi.mock("@/lib/providers/image/mock", () => ({
	MockImage: vi.fn(),
}));
vi.mock("@/lib/providers/video/runware", () => ({
	RunwareVideo: vi.fn(),
}));
vi.mock("@/lib/providers/video/mock", () => ({
	MockVideo: vi.fn(),
}));
vi.mock("@/lib/providers/music/elevenlabs", () => ({
	ElevenLabsMusic: vi.fn(),
}));
vi.mock("@/lib/providers/music/mock", () => ({
	MockMusic: vi.fn(),
}));
vi.mock("@/lib/providers/sfx/elevenlabs", () => ({
	ElevenLabsSFX: vi.fn(),
}));
vi.mock("@/lib/providers/sfx/mock", () => ({
	MockSFX: vi.fn(),
}));
vi.mock("@/lib/providers/llm/anthropic", () => ({
	AnthropicLLM: vi.fn(),
}));
vi.mock("@/lib/providers/llm/mock", () => ({
	MockLLM: vi.fn(),
}));
vi.mock("@/lib/providers/tts/cartesia", () => ({
	CartesiaTTS: vi.fn(),
}));
vi.mock("@/lib/providers/tts/mock", () => ({
	MockTTS: vi.fn(),
}));

import { MockImage } from "@/lib/providers/image/mock";
import { MockVideo } from "@/lib/providers/video/mock";
import { MockMusic } from "@/lib/providers/music/mock";
import { MockSFX } from "@/lib/providers/sfx/mock";
import { MockLLM } from "@/lib/providers/llm/mock";
import { MockTTS } from "@/lib/providers/tts/mock";
import {
	getImageProvider,
	getVideoProvider,
	getMusicProvider,
	getSFXProvider,
	getLLMProvider,
	getTTSProvider,
} from "../providers";

describe("provider factories", () => {
	const originalEnv = process.env;

	afterEach(() => {
		process.env = originalEnv;
	});

	it("returns MockImage/MockVideo when RUNWARE_API_KEY is missing", () => {
		process.env = { ...originalEnv };
		delete process.env.RUNWARE_API_KEY;

		const image = getImageProvider();
		expect(MockImage).toHaveBeenCalled();
		expect(image).toBeInstanceOf(MockImage);

		const video = getVideoProvider();
		expect(MockVideo).toHaveBeenCalled();
		expect(video).toBeInstanceOf(MockVideo);
	});

	it("returns MockMusic/MockSFX when ELEVENLABS_API_KEY is missing", () => {
		process.env = { ...originalEnv };
		delete process.env.ELEVENLABS_API_KEY;

		const music = getMusicProvider();
		expect(MockMusic).toHaveBeenCalled();
		expect(music).toBeInstanceOf(MockMusic);

		const sfx = getSFXProvider();
		expect(MockSFX).toHaveBeenCalled();
		expect(sfx).toBeInstanceOf(MockSFX);
	});

	it("returns MockLLM when ANTHROPIC_API_KEY is missing", () => {
		process.env = { ...originalEnv };
		delete process.env.ANTHROPIC_API_KEY;
		const provider = getLLMProvider();
		expect(MockLLM).toHaveBeenCalled();
		expect(provider).toBeInstanceOf(MockLLM);
	});

	it("returns MockTTS when CARTESIA_API_KEY is missing", () => {
		process.env = { ...originalEnv };
		delete process.env.CARTESIA_API_KEY;
		const provider = getTTSProvider();
		expect(MockTTS).toHaveBeenCalled();
		expect(provider).toBeInstanceOf(MockTTS);
	});
});
