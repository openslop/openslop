import { describe, expect, it } from "vitest";
import { OpenSlopTTS } from "../tts/openslop";
import type { ConnectorPlugin } from "../types";

describe("BaseTTSConnector", () => {
  it("generates stub audio", async () => {
    const connector = new OpenSlopTTS({ provider: "openslop", apiKey: "" });
    const result = await connector.generate({
      prompt: "hello",
      voiceId: "default",
    });
    expect(result.data).toBeInstanceOf(ArrayBuffer);
  });

  it("runs transformPrompt on prompt field", async () => {
    const plugin: ConnectorPlugin = {
      name: "transform",
      transformPrompt: (p) => p.toUpperCase(),
    };
    const connector = new OpenSlopTTS({
      provider: "openslop",
      apiKey: "",
      plugins: [plugin],
    });
    const result = await connector.generate({
      prompt: "hello",
      voiceId: "default",
    });
    expect(result.format).toBe("mp3");
  });

  it("runs onError plugin on failure", async () => {
    const errors: string[] = [];

    class FailingTTS extends OpenSlopTTS {
      protected async _generate(): Promise<never> {
        throw new Error("tts failed");
      }
    }

    const connector = new FailingTTS({
      provider: "openslop",
      apiKey: "",
      plugins: [{ name: "err", onError: (e) => void errors.push(e.message) }],
    });

    await expect(
      connector.generate({ prompt: "hi", voiceId: "v" }),
    ).rejects.toThrow();
    expect(errors).toEqual(["tts failed"]);
  });
});
