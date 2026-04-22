import type { ImageGenerateParams } from "@/lib/connectors/types";
import { MockProvider } from "../mock-base";

const BLOB_BASE =
  "https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/image/mock";

export class MockImage extends MockProvider<ImageGenerateParams> {
  protected readonly delayMs = 2000;
  protected readonly variants = [
    { id: "1", result: { image: `${BLOB_BASE}/1/output.webp` } },
    { id: "2", result: { image: `${BLOB_BASE}/2/output.jpg` } },
    { id: "3", result: { image: `${BLOB_BASE}/3/output.png` } },
  ];
}
