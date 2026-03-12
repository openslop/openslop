import { describe, expect, it } from "vitest";
import { BaseProvider } from "@/lib/providers/base";
import { BaseConnector } from "../base";
import type { ConnectorConfig, ConnectorType, ModelInfo } from "../types";

class MockProvider extends BaseProvider {
  async generate(): Promise<unknown> {
    return {};
  }
}

class TestConnector extends BaseConnector {
  readonly type: ConnectorType = "llm";
  async listModels(): Promise<ModelInfo[]> {
    return [{ id: "test", name: "Test" }];
  }
}

describe("BaseConnector", () => {
  const config: ConnectorConfig = {
    provider: "test",
    apiKey: "key",
    plugins: [{ name: "p1" }],
  };

  it("init is a no-op by default", async () => {
    const c = new TestConnector(new MockProvider(), config);
    await expect(c.init()).resolves.toBeUndefined();
  });

  it("validate returns true by default", async () => {
    const c = new TestConnector(new MockProvider(), config);
    await expect(c.validate()).resolves.toBe(true);
  });

  it("destroy is a no-op by default", async () => {
    const c = new TestConnector(new MockProvider(), config);
    await expect(c.destroy()).resolves.toBeUndefined();
  });

  it("extracts plugins from config", () => {
    const c = new TestConnector(new MockProvider(), config);
    expect((c as unknown as { plugins: unknown[] }).plugins).toHaveLength(1);
  });

  it("defaults plugins to empty array", () => {
    const c = new TestConnector(new MockProvider(), {
      provider: "test",
      apiKey: "key",
    });
    expect((c as unknown as { plugins: unknown[] }).plugins).toEqual([]);
  });
});
