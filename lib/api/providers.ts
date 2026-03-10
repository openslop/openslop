import { RunwareImage } from "@/lib/providers/image/runware";
import { RunwareVideo } from "@/lib/providers/video/runware";
import { ElevenLabsMusic } from "@/lib/providers/music/elevenlabs";
import { ElevenLabsSFX } from "@/lib/providers/sfx/elevenlabs";
import { AnthropicLLM } from "@/lib/providers/llm/anthropic";
import { CartesiaTTS } from "@/lib/providers/tts/cartesia";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function getImageProvider() {
  return new RunwareImage(requireEnv("RUNWARE_API_KEY"));
}

export function getVideoProvider() {
  return new RunwareVideo(requireEnv("RUNWARE_API_KEY"));
}

export function getMusicProvider() {
  return new ElevenLabsMusic(requireEnv("ELEVENLABS_API_KEY"));
}

export function getSFXProvider() {
  return new ElevenLabsSFX(requireEnv("ELEVENLABS_API_KEY"));
}

export function getLLMProvider() {
  return new AnthropicLLM(requireEnv("ANTHROPIC_API_KEY"));
}

export function getTTSProvider() {
  return new CartesiaTTS(requireEnv("CARTESIA_API_KEY"));
}
