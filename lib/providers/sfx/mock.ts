import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { SFXGenerateParams } from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { pickRandom } from "../mock-utils";

const MOCK_VARIANTS: BundleResponse[] = [
  { id: "1", provider: "mock", result: { audio: "output.mp3" } },
  { id: "2", provider: "mock", result: { audio: "output.wav" } },
  { id: "3", provider: "mock", result: { audio: "output.m4a" } },
];

export class MockSFX extends BaseProvider<SFXGenerateParams, BundleResponse> {
  async generate(): Promise<BundleResponse> {
    return pickRandom(MOCK_VARIANTS);
  }
}
