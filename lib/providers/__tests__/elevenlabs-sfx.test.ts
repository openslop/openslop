import { describe, expect, it, vi, beforeEach } from "vitest";

const mockConvert = vi.fn();

vi.mock("@elevenlabs/elevenlabs-js", () => ({
  ElevenLabsClient: class {
    textToSoundEffects = { convert: mockConvert };
  },
}));

import { ElevenLabsSFX } from "../sfx/elevenlabs";

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

describe("ElevenLabsSFX", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates sfx and returns ArrayBuffer", async () => {
    const audio = new Uint8Array([5, 6, 7]);
    mockConvert.mockResolvedValue(mockReadableStream(audio));

    const provider = new ElevenLabsSFX("test-key");
    const result = await provider.generate({ prompt: "boom" });

    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(new Uint8Array(result)).toEqual(audio);
    expect(mockConvert).toHaveBeenCalledWith({
      text: "boom",
      durationSeconds: 5,
      outputFormat: "mp3_22050_32",
    });
  });

  it("passes custom duration", async () => {
    mockConvert.mockResolvedValue(mockReadableStream(new Uint8Array([0])));

    const provider = new ElevenLabsSFX("test-key");
    await provider.generate({ prompt: "crash", durationSeconds: 10 });

    expect(mockConvert).toHaveBeenCalledWith(
      expect.objectContaining({ durationSeconds: 10 }),
    );
  });
});
