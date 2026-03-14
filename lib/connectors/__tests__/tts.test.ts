import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenSlopTTS } from "../tts/openslop";
import type { ConnectorPlugin } from "../types";

function mockJsonResponse(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

const ttsResult = {
  data: "audio-base64",
  textTimestamps: [{ text: "hello", start: 0, end: 0.5 }],
};

describe("BaseTTSConnector", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockJsonResponse(ttsResult),
    );
  });

  it("generates TTS via provider", async () => {
    const connector = new OpenSlopTTS({
      provider: "openslop",
      model: "test-model",
      apiKey: "",
    });
    const result = await connector.generate({
      prompt: "hello",
      voiceId: "default",
    });
    expect(result.data).toBe("audio-base64");
    expect(result.textTimestamps).toHaveLength(1);
  });

  it("runs transformPrompt on prompt field", async () => {
    const plugin: ConnectorPlugin = {
      name: "transform",
      transformPrompt: (p) => p.toUpperCase(),
    };
    const connector = new OpenSlopTTS({
      provider: "openslop",
      model: "test-model",
      apiKey: "",
      plugins: [plugin],
    });
    const result = await connector.generate({
      prompt: "hello",
      voiceId: "default",
    });
    expect(result.data).toBe("audio-base64");
  });

  it("runs onError plugin on failure", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("tts failed"));
    const errors: string[] = [];

    const connector = new OpenSlopTTS({
      provider: "openslop",
      model: "test-model",
      apiKey: "",
      plugins: [
        { name: "err", onError: (e: Error) => void errors.push(e.message) },
      ],
    });

    await expect(
      connector.generate({ prompt: "hi", voiceId: "v" }),
    ).rejects.toThrow();
    expect(errors).toEqual(["tts failed"]);
  });
});
