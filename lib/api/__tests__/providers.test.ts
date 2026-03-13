import { describe, expect, it, vi, afterEach } from "vitest";

vi.mock("@/lib/providers/image/runware", () => ({
  RunwareImage: vi.fn(),
}));
vi.mock("@/lib/providers/video/runware", () => ({
  RunwareVideo: vi.fn(),
}));
vi.mock("@/lib/providers/music/elevenlabs", () => ({
  ElevenLabsMusic: vi.fn(),
}));
vi.mock("@/lib/providers/sfx/elevenlabs", () => ({
  ElevenLabsSFX: vi.fn(),
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

import { MockLLM } from "@/lib/providers/llm/mock";
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

  it("throws when RUNWARE_API_KEY is missing", () => {
    process.env = { ...originalEnv };
    delete process.env.RUNWARE_API_KEY;
    expect(() => getImageProvider()).toThrow(
      "Missing environment variable: RUNWARE_API_KEY",
    );
    expect(() => getVideoProvider()).toThrow(
      "Missing environment variable: RUNWARE_API_KEY",
    );
  });

  it("throws when ELEVENLABS_API_KEY is missing", () => {
    process.env = { ...originalEnv };
    delete process.env.ELEVENLABS_API_KEY;
    expect(() => getMusicProvider()).toThrow(
      "Missing environment variable: ELEVENLABS_API_KEY",
    );
    expect(() => getSFXProvider()).toThrow(
      "Missing environment variable: ELEVENLABS_API_KEY",
    );
  });

  it("returns MockLLM when ANTHROPIC_API_KEY is missing", () => {
    process.env = { ...originalEnv };
    delete process.env.ANTHROPIC_API_KEY;
    const provider = getLLMProvider();
    expect(MockLLM).toHaveBeenCalled();
    expect(provider).toBeInstanceOf(MockLLM);
  });

  it("throws when CARTESIA_API_KEY is missing", () => {
    process.env = { ...originalEnv };
    delete process.env.CARTESIA_API_KEY;
    expect(() => getTTSProvider()).toThrow(
      "Missing environment variable: CARTESIA_API_KEY",
    );
  });
});
