import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenSlopSFX } from "../sfx/openslop";
import type { ConnectorPlugin } from "../types";

function mockBinaryResponse(data: number[] = [0]) {
  return new Response(new Uint8Array(data).buffer, {
    status: 200,
    headers: { "content-type": "audio/mpeg" },
  });
}

describe("BaseSFXConnector", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockBinaryResponse());
  });

  it("generates audio via provider", async () => {
    const connector = new OpenSlopSFX({ provider: "openslop", apiKey: "" });
    const result = await connector.generate({ prompt: "explosion" });
    expect(result).toBeInstanceOf(ArrayBuffer);
  });

  it("runs plugins in order", async () => {
    const order: string[] = [];
    const plugin: ConnectorPlugin = {
      name: "tracker",
      transformPrompt: (p) => {
        order.push("transform");
        return p;
      },
      beforeGenerate: (p) => {
        order.push("before");
        return p;
      },
      afterGenerate: (r) => {
        order.push("after");
        return r;
      },
    };
    const connector = new OpenSlopSFX({
      provider: "openslop",
      apiKey: "",
      plugins: [plugin],
    });
    await connector.generate({ prompt: "test" });
    expect(order).toEqual(["transform", "before", "after"]);
  });
});
