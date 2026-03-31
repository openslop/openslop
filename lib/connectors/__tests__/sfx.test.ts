import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenSlopSFX } from "../sfx/openslop";
import type { ConnectorPlugin } from "../types";

const TEST_ID = "test-id";
const BUNDLE_URL = `/assets/sfx/openslop/${TEST_ID}`;
const AUDIO_URL = `${BUNDLE_URL}/output.mp3`;

function jsonResponse(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function mockFetchChain() {
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    jsonResponse({
      id: TEST_ID,
      provider: "openslop",
      result: { audio: "output.mp3" },
    }),
  );
}

describe("BaseSFXConnector", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("generates audio via provider", async () => {
    mockFetchChain();
    const connector = new OpenSlopSFX({
      defaultModel: "test-model",
      models: ["test-model"],
      isDefault: true,
      apiKey: "",
    });
    const result = await connector.generate({ prompt: "explosion" });
    expect(result.url).toBe(AUDIO_URL);
  });

  it("runs plugins in order", async () => {
    mockFetchChain();
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
      defaultModel: "test-model",
      models: ["test-model"],
      isDefault: true,
      apiKey: "",
      plugins: [plugin],
    });
    await connector.generate({ prompt: "test" });
    expect(order).toEqual(["transform", "before", "after"]);
  });
});
