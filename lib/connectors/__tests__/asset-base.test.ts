import { describe, expect, it, vi, beforeEach } from "vitest";
import { BaseAssetConnector } from "../asset-base";
import { AssetBundle } from "@/lib/api/asset-bundle";
import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { ConnectorConfig, ConnectorType, ModelInfo } from "../types";

type TestParams = { prompt: string };
type TestResult = { url: string; durationSec: number };

class TestAssetConnector extends BaseAssetConnector<TestParams, TestResult> {
  readonly type: ConnectorType = "image";
  readonly assetKey = "image";

  protected gateway: {
    generate(params: TestParams): Promise<BundleResponse>;
  };

  constructor(
    config: ConnectorConfig,
    generateFn?: (params: TestParams) => Promise<BundleResponse>,
  ) {
    super(config);
    this.gateway = { generate: generateFn ?? vi.fn() };
  }

  async listModels(): Promise<ModelInfo[]> {
    return [{ id: "test", name: "Test" }];
  }
}

const config: ConnectorConfig = {
  defaultModel: "test-model",
  models: ["test-model"],
  isDefault: true,
};

describe("BaseAssetConnector", () => {
  beforeEach(() => {
    AssetBundle.baseUrl = "https://blob.example.com";
  });

  describe("resolveBundle", () => {
    it("resolves asset url and duration from bundle", async () => {
      const connector = new TestAssetConnector(config);
      const bundle = new AssetBundle(
        "https://blob.example.com/assets/image/runware/abc",
        {
          version: 1,
          type: "image",
          createdAt: "",
          result: { image: "output.png" },
          metadata: { durationSec: 10 },
        },
      );

      const result = await connector.resolveBundle(bundle);
      expect(result).toEqual({
        url: "https://blob.example.com/assets/image/runware/abc/output.png",
        durationSec: 10,
      });
    });

    it("defaults duration to 0 when metadata is missing", async () => {
      const connector = new TestAssetConnector(config);
      const bundle = new AssetBundle(
        "https://blob.example.com/assets/image/mock/xyz",
        {
          version: 1,
          type: "image",
          createdAt: "",
          result: { image: "output.jpg" },
        },
      );

      const result = await connector.resolveBundle(bundle);
      expect(result.durationSec).toBe(0);
    });

    it("defaults duration to 0 when durationSec is missing from metadata", async () => {
      const connector = new TestAssetConnector(config);
      const bundle = new AssetBundle(
        "https://blob.example.com/assets/image/mock/xyz",
        {
          version: 1,
          type: "image",
          createdAt: "",
          result: { image: "output.jpg" },
          metadata: { otherField: "value" },
        },
      );

      const result = await connector.resolveBundle(bundle);
      expect(result.durationSec).toBe(0);
    });
  });

  describe("_generate (via generate)", () => {
    it("calls gateway.generate and resolves the bundle", async () => {
      const response: BundleResponse = {
        id: "abc",
        provider: "mock",
        result: { image: "output.png" },
        metadata: { durationSec: 5 },
      };
      const generateFn = vi.fn().mockResolvedValue(response);
      const connector = new TestAssetConnector(config, generateFn);

      const result = await connector.generate({ prompt: "test" });

      expect(generateFn).toHaveBeenCalledWith({ prompt: "test" });
      expect(result.url).toBe(
        "https://blob.example.com/assets/image/mock/abc/output.png",
      );
      expect(result.durationSec).toBe(5);
    });

    it("propagates gateway errors", async () => {
      const generateFn = vi.fn().mockRejectedValue(new Error("gateway failed"));
      const connector = new TestAssetConnector(config, generateFn);

      await expect(connector.generate({ prompt: "test" })).rejects.toThrow(
        "gateway failed",
      );
    });

    it("handles external urls in bundle response", async () => {
      const response: BundleResponse = {
        id: "xyz",
        provider: "runware",
        result: { image: "https://cdn.example.com/image.webp" },
      };
      const generateFn = vi.fn().mockResolvedValue(response);
      const connector = new TestAssetConnector(config, generateFn);

      const result = await connector.generate({ prompt: "test" });
      expect(result.url).toBe("https://cdn.example.com/image.webp");
      expect(result.durationSec).toBe(0);
    });
  });
});
