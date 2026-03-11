import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenSlopImage } from "../image/openslop";
import type { ConnectorPlugin } from "../types";

vi.spyOn(globalThis, "fetch").mockResolvedValue(
  new Response(
    JSON.stringify({
      data: "base64img",
      format: "png",
      width: 512,
      height: 512,
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  ),
);

describe("BaseImageConnector", () => {
  beforeEach(() => {
    vi.mocked(fetch).mockClear();
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          data: "base64img",
          format: "png",
          width: 512,
          height: 512,
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
  });

  it("generates image via provider", async () => {
    const connector = new OpenSlopImage({ provider: "openslop", apiKey: "" });
    const result = await connector.generate({ prompt: "a cat" });
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
