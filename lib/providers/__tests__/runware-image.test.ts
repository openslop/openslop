import { describe, expect, it, vi, beforeEach } from "vitest";

const mockDisconnect = vi.fn();
const mockImageInference = vi.fn();

vi.mock("@runware/sdk-js", () => ({
  Runware: class {
    constructor() {
      return {
        imageInference: mockImageInference,
        disconnect: mockDisconnect,
      };
    }
  },
}));

import { RunwareImage } from "../image/runware";

describe("RunwareImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates an image with defaults", async () => {
    mockImageInference.mockResolvedValue([
      { imageBase64Data: "abc123", seed: 1 },
    ]);

    const provider = new RunwareImage("test-key");
    const result = await provider.generate({ prompt: "a cat" });

    expect(result).toEqual({
      data: "abc123",
      format: "png",
      width: 512,
      height: 512,
    });
    expect(mockImageInference).toHaveBeenCalledWith({
      positivePrompt: "a cat",
      model: "runware:z-image@turbo",
      width: 512,
      height: 512,
      outputType: "base64Data",
      numberResults: 1,
    });
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("passes custom dimensions and model", async () => {
    mockImageInference.mockResolvedValue([{ imageBase64Data: "data" }]);

    const provider = new RunwareImage("test-key");
    await provider.generate({
      prompt: "sunset",
      model: "custom-model",
      width: 1024,
      height: 768,
    });

    expect(mockImageInference).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "custom-model",
        width: 1024,
        height: 768,
      }),
    );
  });

  it("throws when no image data returned", async () => {
    mockImageInference.mockResolvedValue([{}]);

    const provider = new RunwareImage("test-key");
    await expect(provider.generate({ prompt: "test" })).rejects.toThrow(
      "No image data returned",
    );
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("throws and disconnects when inference fails", async () => {
    mockImageInference.mockRejectedValue(new Error("API error"));

    const provider = new RunwareImage("test-key");
    await expect(provider.generate({ prompt: "test" })).rejects.toThrow(
      "API error",
    );
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
