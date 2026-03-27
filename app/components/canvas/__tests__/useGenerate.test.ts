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
  it("resolves image connector and returns data URI", async () => {
    const generate = vi.fn().mockResolvedValue({
      data: "abc123",
      format: "png",
      width: 512,
      height: 512,
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
      kind: "image",
      src: "data:image/png;base64,abc123",
    });
  });

  it("passes extra params to connector generate for TTS", async () => {
    const generate = vi.fn().mockResolvedValue({
      data: btoa("audiodata"),
      textTimestamps: [],
    });
    (factory.createConnector as Mock).mockReturnValue({ generate });

    const mockUrl = "blob:http://localhost/mock-tts";
    vi.spyOn(URL, "createObjectURL").mockReturnValue(mockUrl);

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
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(result).toEqual({ kind: "audio", src: mockUrl });
  });

  it("converts ArrayBuffer to object URL for music", async () => {
    const buf = new ArrayBuffer(8);
    const generate = vi.fn().mockResolvedValue(buf);
    (factory.createConnector as Mock).mockReturnValue({ generate });

    const mockUrl = "blob:http://localhost/mock-music";
    vi.spyOn(URL, "createObjectURL").mockReturnValue(mockUrl);

    const result = await generateForElement(
      "music",
      "openslop",
      baseConfig,
      "epic music",
      {},
    );

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(result).toEqual({ kind: "audio", src: mockUrl });
  });

  it("converts ArrayBuffer to object URL for sfx", async () => {
    const buf = new ArrayBuffer(8);
    const generate = vi.fn().mockResolvedValue(buf);
    (factory.createConnector as Mock).mockReturnValue({ generate });

    const mockUrl = "blob:http://localhost/mock-sfx";
    vi.spyOn(URL, "createObjectURL").mockReturnValue(mockUrl);

    const result = await generateForElement(
      "sfx",
      "openslop",
      baseConfig,
      "explosion",
      {},
    );

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(result).toEqual({ kind: "audio", src: mockUrl });
  });

  it("handles video generation failure", async () => {
    const generate = vi.fn().mockResolvedValue({
      jobId: "job-1",
      status: "failed",
      error: "GPU timeout",
    });
    (factory.createConnector as Mock).mockReturnValue({ generate });

    await expect(
      generateForElement("video", "openslop", baseConfig, "a scene", {}),
    ).rejects.toThrow("GPU timeout");
  });

  it("returns video URL on successful completion", async () => {
    const generate = vi.fn().mockResolvedValue({
      jobId: "job-1",
      status: "completed",
      resultUrl: "https://cdn.example.com/video.mp4",
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
      kind: "video",
      src: "https://cdn.example.com/video.mp4",
    });
  });

  it("passes duration as extra param for video", async () => {
    const generate = vi.fn().mockResolvedValue({
      jobId: "job-1",
      status: "completed",
      resultUrl: "https://cdn.example.com/video.mp4",
    });
    (factory.createConnector as Mock).mockReturnValue({ generate });

    await generateForElement("video", "openslop", baseConfig, "a scene", {
      duration: "10",
    });

    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({ duration: "10" }),
    );
  });

  it("throws for LLM connector type", async () => {
    const generate = vi.fn();
    (factory.createConnector as Mock).mockReturnValue({ generate });

    await expect(
      generateForElement("llm", "openslop", baseConfig, "test", {}),
    ).rejects.toThrow("LLM generation not supported");
  });
});
