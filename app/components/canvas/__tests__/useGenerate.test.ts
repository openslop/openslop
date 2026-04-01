import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import { generateForElement } from "@/lib/generation/generateForElement";
import * as factory from "@/lib/connectors/factory";

vi.mock("@/lib/connectors/factory", () => ({
  createConnector: vi.fn(),
}));

const baseConfig = {
  defaultModel: "test-model",
  models: ["test-model"],
  isDefault: true,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("generateForElement", () => {
  it("resolves image connector and returns url", async () => {
    const generate = vi.fn().mockResolvedValue({
      url: "https://blob.example.com/image.png",
    });
    (factory.createConnector as Mock).mockReturnValue({ generate });

    const result = await generateForElement(
      "image",
      "openslop",
      baseConfig,
      "a cat",
      {},
    );

    expect(factory.createConnector).toHaveBeenCalledWith(
      "image",
      "openslop",
      baseConfig,
    );
    expect(result).toEqual({
      url: "https://blob.example.com/image.png",
    });
  });

  it("passes extra params to connector generate for TTS", async () => {
    const generate = vi.fn().mockResolvedValue({
      url: "https://blob.example.com/tts.wav",
      textTimestamps: [],
    });
    (factory.createConnector as Mock).mockReturnValue({ generate });

    const result = await generateForElement(
      "tts",
      "openslop",
      baseConfig,
      "hello world",
      { gender: "male", accent: "american" },
    );

    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "hello world",
        gender: "male",
        accent: "american",
      }),
    );
    expect(result).toEqual({
      url: "https://blob.example.com/tts.wav",
      textTimestamps: [],
    });
  });

  it("returns url for music", async () => {
    const generate = vi.fn().mockResolvedValue({
      url: "https://blob.example.com/music.mp3",
    });
    (factory.createConnector as Mock).mockReturnValue({ generate });

    const result = await generateForElement(
      "music",
      "openslop",
      baseConfig,
      "epic music",
      {},
    );

    expect(result).toEqual({
      url: "https://blob.example.com/music.mp3",
    });
  });

  it("returns url for sfx", async () => {
    const generate = vi.fn().mockResolvedValue({
      url: "https://blob.example.com/sfx.mp3",
    });
    (factory.createConnector as Mock).mockReturnValue({ generate });

    const result = await generateForElement(
      "sfx",
      "openslop",
      baseConfig,
      "explosion",
      {},
    );

    expect(result).toEqual({
      url: "https://blob.example.com/sfx.mp3",
    });
  });

  it("returns video url on successful generation", async () => {
    const generate = vi.fn().mockResolvedValue({
      url: "https://cdn.example.com/video.mp4",
    });
    (factory.createConnector as Mock).mockReturnValue({ generate });

    const result = await generateForElement(
      "video",
      "openslop",
      baseConfig,
      "a scene",
      {},
    );

    expect(result).toEqual({
      url: "https://cdn.example.com/video.mp4",
    });
  });

  it("passes duration as extra param for video", async () => {
    const generate = vi.fn().mockResolvedValue({
      url: "https://cdn.example.com/video.mp4",
    });
    (factory.createConnector as Mock).mockReturnValue({ generate });

    await generateForElement("video", "openslop", baseConfig, "a scene", {
      duration: "10",
    });

    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({ duration: "10" }),
    );
  });
});
