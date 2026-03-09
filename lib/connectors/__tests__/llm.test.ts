import { describe, expect, it, vi } from "vitest";
import { OpenSlopLLM } from "../llm/openslop";
import type { ConnectorPlugin } from "../types";

describe("BaseLLMConnector", () => {
  it("runs transformPrompt plugin", async () => {
    const plugin: ConnectorPlugin = {
      name: "transform",
      transformPrompt: (p) => `transformed: ${p}`,
    };
    const connector = new OpenSlopLLM({
      provider: "openslop",
      apiKey: "",
      plugins: [plugin],
    });
    const result = await connector.generate({ prompt: "test" });
    expect(result.text).toContain("transformed: test");
  });

  it("runs afterGenerate plugin", async () => {
    const plugin: ConnectorPlugin = {
      name: "after",
      afterGenerate: (r) => ({
        ...(r as object),
        text: "modified",
      }),
    };
    const connector = new OpenSlopLLM({
      provider: "openslop",
      apiKey: "",
      plugins: [plugin],
    });
    const result = await connector.generate({ prompt: "test" });
    expect(result.text).toBe("modified");
  });

  it("runs onError plugin when _generate fails", async () => {
    const errors: string[] = [];
    const plugin: ConnectorPlugin = {
      name: "error-handler",
      onError: (e) => void errors.push(e.message),
    };

    class FailingLLM extends OpenSlopLLM {
      protected async _generate(): Promise<never> {
        throw new Error("generation failed");
      }
    }

    const connector = new FailingLLM({
      provider: "openslop",
      apiKey: "",
      plugins: [plugin],
    });

    await expect(connector.generate({ prompt: "test" })).rejects.toThrow(
      "generation failed",
    );
    expect(errors).toEqual(["generation failed"]);
  });

  it("runs plugins in order", async () => {
    const order: string[] = [];
    const plugins: ConnectorPlugin[] = [
      {
        name: "first",
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
      },
    ];
    const connector = new OpenSlopLLM({
      provider: "openslop",
      apiKey: "",
      plugins,
    });
    await connector.generate({ prompt: "test" });
    expect(order).toEqual(["transform", "before", "after"]);
  });
});
