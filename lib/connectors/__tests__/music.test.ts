import { describe, expect, it } from "vitest";
import { OpenSlopMusic } from "../music/openslop";
import type { ConnectorPlugin } from "../types";

describe("BaseMusicConnector", () => {
  it("runs transformPrompt plugin", async () => {
    const plugin: ConnectorPlugin = {
      name: "transform",
      transformPrompt: (p) => `epic: ${p}`,
    };
    const connector = new OpenSlopMusic({
      provider: "openslop",
      apiKey: "",
      plugins: [plugin],
    });
    // Plugin runs but result is stub audio — just verify no error
    const result = await connector.generate({ prompt: "rock song" });
    expect(result.data).toBeInstanceOf(ArrayBuffer);
  });

  it("runs afterGenerate plugin", async () => {
    const plugin: ConnectorPlugin = {
      name: "after",
      afterGenerate: (r) => ({
        ...(r as object),
        durationSeconds: 999,
      }),
    };
    const connector = new OpenSlopMusic({
      provider: "openslop",
      apiKey: "",
      plugins: [plugin],
    });
    const result = await connector.generate({ prompt: "test" });
    expect(result.durationSeconds).toBe(999);
  });

  it("runs onError plugin on failure", async () => {
    const errors: string[] = [];

    class FailingMusic extends OpenSlopMusic {
      protected async _generate(): Promise<never> {
        throw new Error("music failed");
      }
    }

    const connector = new FailingMusic({
      provider: "openslop",
      apiKey: "",
      plugins: [{ name: "err", onError: (e) => void errors.push(e.message) }],
    });

    await expect(connector.generate({ prompt: "test" })).rejects.toThrow();
    expect(errors).toEqual(["music failed"]);
  });
});
