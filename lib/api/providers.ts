import { RunwareImage } from "@/lib/providers/image/runware";
import { MockImage } from "@/lib/providers/image/mock";
import { RunwareVideo } from "@/lib/providers/video/runware";
import { MockVideo } from "@/lib/providers/video/mock";
import { ElevenLabsMusic } from "@/lib/providers/music/elevenlabs";
import { MockMusic } from "@/lib/providers/music/mock";
import { ElevenLabsSFX } from "@/lib/providers/sfx/elevenlabs";
import { MockSFX } from "@/lib/providers/sfx/mock";
import { AnthropicLLM } from "@/lib/providers/llm/anthropic";
import { MockLLM } from "@/lib/providers/llm/mock";
import { CartesiaTTS } from "@/lib/providers/tts/cartesia";
import { MockTTS } from "@/lib/providers/tts/mock";

function withMockFallback<TReal, TMock>(
	envVar: string,
	real: (apiKey: string) => TReal,
	mock: () => TMock,
): TReal | TMock {
	const apiKey = process.env[envVar];
	if (!apiKey) return mock();
	return real(apiKey);
}

const cache = new Map<string, unknown>();

function cached<T>(key: string, factory: () => T): T {
	if (!cache.has(key)) cache.set(key, factory());
	return cache.get(key) as T;
}

export function getImageProvider() {
	return cached("image", () =>
		withMockFallback(
			"RUNWARE_API_KEY",
			(k) => new RunwareImage(k),
			() => new MockImage(),
		),
	);
}

export function getVideoProvider() {
	return cached("video", () =>
		withMockFallback(
			"RUNWARE_API_KEY",
			(k) => new RunwareVideo(k),
			() => new MockVideo(),
		),
	);
}

export function getMusicProvider() {
	return cached("music", () =>
		withMockFallback(
			"ELEVENLABS_API_KEY",
			(k) => new ElevenLabsMusic(k),
			() => new MockMusic(),
		),
	);
}

export function getSFXProvider() {
	return cached("sfx", () =>
		withMockFallback(
			"ELEVENLABS_API_KEY",
			(k) => new ElevenLabsSFX(k),
			() => new MockSFX(),
		),
	);
}

export function getLLMProvider() {
	return cached("llm", () =>
		withMockFallback(
			"ANTHROPIC_API_KEY",
			(k) => new AnthropicLLM(k),
			() => new MockLLM(),
		),
	);
}

export function getTTSProvider() {
	return cached("tts", () =>
		withMockFallback(
			"CARTESIA_API_KEY",
			(k) => new CartesiaTTS(k),
			() => new MockTTS(),
		),
	);
}
