import { describe, expect, it } from "vitest";
import { hydrateConnectorConfig } from "../utils/hydrateConnectorConfig";
import type { CanvasElement } from "../types";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";

const connectors: ConnectorRegistry = {
  llm: { provider: "openslop", model: "llm-v1", apiKey: "" },
  tts: { provider: "openslop", model: "tts-v1", apiKey: "" },
  image: { provider: "openslop", model: "img-v1", apiKey: "" },
  video: { provider: "openslop", model: "vid-v1", apiKey: "" },
  sfx: { provider: "openslop", model: "sfx-v1", apiKey: "" },
  music: { provider: "openslop", model: "music-v1", apiKey: "" },
};

function makeNode(
  type: CanvasElement["type"],
  customAttributes?: Record<string, string>,
): CanvasElement {
  return {
    id: "n1",
    type,
    customAttributes,
    children: [{ id: "t1", type, text: "" }],
  };
}

describe("hydrateConnectorConfig", () => {
  const hydrate = hydrateConnectorConfig(connectors);

  it("adds model and provider for a tts element", () => {
    const node = makeNode("narration", { gender: "male" });
    const result = hydrate(node);
    expect(result.customAttributes).toEqual({
      gender: "male",
      model: "tts-v1",
      provider: "openslop",
    });
  });

  it("adds model and provider for an image element", () => {
    const result = hydrate(makeNode("image"));
    expect(result.customAttributes).toMatchObject({
      model: "img-v1",
      provider: "openslop",
    });
  });

  it("adds model and provider for a clip (video) element", () => {
    const result = hydrate(makeNode("clip", { duration: "5s" }));
    expect(result.customAttributes).toEqual({
      duration: "5s",
      model: "vid-v1",
      provider: "openslop",
    });
  });

  it("returns node unchanged when connector has no model", () => {
    const noModel: ConnectorRegistry = {
      ...connectors,
      tts: { provider: "openslop", model: "", apiKey: "" },
    };
    const node = makeNode("narration");
    const result = hydrateConnectorConfig(noModel)(node);
    expect(result).toBe(node);
  });

  it("does not mutate the original node", () => {
    const node = makeNode("narration", { accent: "british" });
    const result = hydrate(node);
    expect(result).not.toBe(node);
    expect(node.customAttributes).toEqual({ accent: "british" });
  });
});
