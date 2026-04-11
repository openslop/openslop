import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ConnectorConfig, AssetResult } from "@/lib/connectors/types";

const mockGenerate = vi.fn<() => Promise<AssetResult>>();

vi.mock("@/lib/connectors/factory", () => ({
  createConnector: vi.fn(() => ({
    generate: mockGenerate,
  })),
}));

import { generateForElement } from "../generateForElement";
import { createConnector } from "@/lib/connectors/factory";

const config: ConnectorConfig = {
  defaultModel: "test-model",
  models: ["test-model"],
  isDefault: true,
};

describe("generateForElement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates connector and calls generate with correct params", async () => {
    const expected: AssetResult = {
      url: "https://example.com/img.png",
      durationSec: 0,
    };
    mockGenerate.mockResolvedValue(expected);

    const result = await generateForElement(
      "image",
      "openslop",
      config,
      "a sunset",
      { width: 1024 },
    );

    expect(createConnector).toHaveBeenCalledWith("image", "openslop", config);
    expect(mockGenerate).toHaveBeenCalledWith({
      prompt: "a sunset",
      model: "test-model",
      width: 1024,
    });
    expect(result).toEqual(expected);
  });

  it("passes default model from config", async () => {
    mockGenerate.mockResolvedValue({ url: "x", durationSec: 0 });

    await generateForElement("music", "openslop", config, "jazz beat", {});

    expect(mockGenerate).toHaveBeenCalledWith({
      prompt: "jazz beat",
      model: "test-model",
    });
  });

  it("merges extra params into generate call", async () => {
    mockGenerate.mockResolvedValue({ url: "x", durationSec: 5 });

    await generateForElement("tts", "openslop", config, "hello world", {
      voiceId: "voice-1",
      speed: "fast",
    });

    expect(mockGenerate).toHaveBeenCalledWith({
      prompt: "hello world",
      model: "test-model",
      voiceId: "voice-1",
      speed: "fast",
    });
  });

  it("propagates errors from connector.generate", async () => {
    mockGenerate.mockRejectedValue(new Error("generation failed"));

    await expect(
      generateForElement("image", "openslop", config, "test", {}),
    ).rejects.toThrow("generation failed");
  });
});
