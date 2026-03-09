import { describe, expect, it } from "vitest";
import { OpenSlopImage } from "../image/openslop";
import type { ConnectorPlugin } from "../types";

describe("BaseImageConnector", () => {
  it("generates stub image", async () => {
    const connector = new OpenSlopImage({ provider: "openslop", apiKey: "" });
    const result = await connector.generate({ prompt: "a cat" });
    expect(result.type).toBe("base64");
    expect(result.format).toBe("png");
    expect(result.width).toBe(512);
  });

  it("runs afterGenerate plugin", async () => {
    const plugin: ConnectorPlugin = {
      name: "resize",
      afterGenerate: (r) => ({
        ...(r as object),
        width: 1024,
      }),
    };
    const connector = new OpenSlopImage({
      provider: "openslop",
      apiKey: "",
      plugins: [plugin],
    });
    const result = await connector.generate({ prompt: "test" });
    expect(result.width).toBe(1024);
  });
});
