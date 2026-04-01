import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { MusicGenerateParams } from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { pickRandom } from "../mock-utils";

const MOCK_VARIANTS: BundleResponse[] = [
  { id: "1", provider: "mock", result: { audio: "output.mp3" } },
  { id: "2", provider: "mock", result: { audio: "output.m4a" } },
  { id: "3", provider: "mock", result: { audio: "output.wav" } },
];

export class MockMusic extends BaseProvider<
  MusicGenerateParams,
  BundleResponse
> {
  async generate(): Promise<BundleResponse> {
    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000));
    return pickRandom(MOCK_VARIANTS);
  }
}
