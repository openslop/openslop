import { RunwareImage } from "@/lib/providers/image/runware";
import { RunwareVideo } from "@/lib/providers/video/runware";
import { ElevenLabsMusic } from "@/lib/providers/music/elevenlabs";
import { ElevenLabsSFX } from "@/lib/providers/sfx/elevenlabs";
import { AnthropicLLM } from "@/lib/providers/llm/anthropic";
import { MockLLM } from "@/lib/providers/llm/mock";
import { CartesiaTTS } from "@/lib/providers/tts/cartesia";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

const cache = new Map<string, unknown>();

function cached<T>(key: string, factory: () => T): T {
  if (!cache.has(key)) cache.set(key, factory());
  return cache.get(key) as T;
}

export function getImageProvider() {
  return cached("image", () => new RunwareImage(requireEnv("RUNWARE_API_KEY")));
}

export function getVideoProvider() {
  return cached("video", () => new RunwareVideo(requireEnv("RUNWARE_API_KEY")));
}

export function getMusicProvider() {
  return cached(
    "music",
    () => new ElevenLabsMusic(requireEnv("ELEVENLABS_API_KEY")),
  );
}

export function getSFXProvider() {
  return cached(
    "sfx",
    () => new ElevenLabsSFX(requireEnv("ELEVENLABS_API_KEY")),
  );
}

export function getLLMProvider() {
  return cached("llm", () => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return new MockLLM();
    return new AnthropicLLM(apiKey);
  });
}

export function getTTSProvider() {
  return cached("tts", () => new CartesiaTTS(requireEnv("CARTESIA_API_KEY")));
}
