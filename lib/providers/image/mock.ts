import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { ImageGenerateParams } from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { pickRandom } from "../mock-utils";

const MOCK_VARIANTS: BundleResponse[] = [
  { id: "1", provider: "mock", result: { image: "output.webp" } },
  { id: "2", provider: "mock", result: { image: "output.jpg" } },
  { id: "3", provider: "mock", result: { image: "output.png" } },
];

export class MockImage extends BaseProvider<
  ImageGenerateParams,
  BundleResponse
> {
  async generate(): Promise<BundleResponse> {
    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000));
    return pickRandom(MOCK_VARIANTS);
  }
}
