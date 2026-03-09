import { describe, expect, it } from "vitest";
import { OpenSlopSFX } from "../sfx/openslop";
import type { ConnectorPlugin } from "../types";

describe("BaseSFXConnector", () => {
  it("generates stub audio", async () => {
    const connector = new OpenSlopSFX({ provider: "openslop", apiKey: "" });
    const result = await connector.generate({ prompt: "explosion" });
    expect(result.data).toBeInstanceOf(ArrayBuffer);
    expect(result.format).toBe("mp3");
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
