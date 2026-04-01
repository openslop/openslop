import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { ImageGenerateParams } from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { pickRandom } from "../mock-utils";

const BLOB_BASE =
  "https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/image/mock";

const MOCK_VARIANTS: BundleResponse[] = [
  {
    id: "1",
    provider: "mock",
    result: { image: `${BLOB_BASE}/1/output.webp` },
  },
  { id: "2", provider: "mock", result: { image: `${BLOB_BASE}/2/output.jpg` } },
  { id: "3", provider: "mock", result: { image: `${BLOB_BASE}/3/output.png` } },
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
