import { describe, expect, it, vi, beforeEach } from "vitest";

const mockCompose = vi.fn();

vi.mock("@elevenlabs/elevenlabs-js", () => ({
  ElevenLabsClient: class {
    music = { compose: mockCompose };
  },
}));

import { ElevenLabsMusic } from "../music/elevenlabs";

function mockReadableStream(data: Uint8Array) {
  let read = false;
  return {
    getReader: () => ({
      read: async () => {
        if (!read) {
          read = true;
          return { done: false, value: data };
        }
        return { done: true, value: undefined };
      },
    }),
  };
}

describe("ElevenLabsMusic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates music and returns ArrayBuffer", async () => {
    const audio = new Uint8Array([1, 2, 3, 4]);
    mockCompose.mockResolvedValue(mockReadableStream(audio));

    const provider = new ElevenLabsMusic("test-key");
    const result = await provider.generate({ prompt: "jazz" });

    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(new Uint8Array(result)).toEqual(audio);
    expect(mockCompose).toHaveBeenCalledWith({
      prompt: "jazz",
      musicLengthMs: 30000,
      modelId: "music_v1",
      outputFormat: "mp3_22050_32",
    });
  });

  it("passes custom duration", async () => {
    mockCompose.mockResolvedValue(mockReadableStream(new Uint8Array([0])));

    const provider = new ElevenLabsMusic("test-key");
    await provider.generate({ prompt: "rock", durationSeconds: 60 });

    expect(mockCompose).toHaveBeenCalledWith(
      expect.objectContaining({ musicLengthMs: 60000 }),
    );
  });
});
