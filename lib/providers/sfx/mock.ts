import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { SFXGenerateParams } from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { pickRandom } from "../mock-utils";

const BLOB_BASE =
  "https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/sfx/mock";

const MOCK_VARIANTS: BundleResponse[] = [
  { id: "1", provider: "mock", result: { audio: `${BLOB_BASE}/1/output.mp3` } },
  { id: "2", provider: "mock", result: { audio: `${BLOB_BASE}/2/output.wav` } },
  { id: "3", provider: "mock", result: { audio: `${BLOB_BASE}/3/output.m4a` } },
];

export class MockSFX extends BaseProvider<SFXGenerateParams, BundleResponse> {
  async generate(): Promise<BundleResponse> {
    return pickRandom(MOCK_VARIANTS);
  }
}
