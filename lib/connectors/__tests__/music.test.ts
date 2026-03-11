import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenSlopMusic } from "../music/openslop";
import type { ConnectorPlugin } from "../types";

function mockBinaryResponse(data: number[] = [0]) {
  return new Response(new Uint8Array(data).buffer, {
    status: 200,
    headers: { "content-type": "audio/mpeg" },
  });
}

describe("BaseMusicConnector", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockBinaryResponse());
  });

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
    const result = await connector.generate({ prompt: "rock song" });
    expect(result).toBeInstanceOf(ArrayBuffer);
  });

  it("runs afterGenerate plugin", async () => {
    const plugin: ConnectorPlugin = {
      name: "after",
      afterGenerate: () => new ArrayBuffer(42),
    };
    const connector = new OpenSlopMusic({
      provider: "openslop",
      apiKey: "",
      plugins: [plugin],
    });
    const result = await connector.generate({ prompt: "test" });
    expect(result.byteLength).toBe(42);
  });

  it("runs onError plugin on failure", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("music failed"));
    const errors: string[] = [];

    const connector = new OpenSlopMusic({
      provider: "openslop",
      apiKey: "",
      plugins: [
        { name: "err", onError: (e: Error) => void errors.push(e.message) },
      ],
    });

    await expect(connector.generate({ prompt: "test" })).rejects.toThrow();
    expect(errors).toEqual(["music failed"]);
  });
});
