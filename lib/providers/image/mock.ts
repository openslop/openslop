import type {
  ImageFormat,
  ImageGenerateParams,
  ImageResult,
} from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { readMockFile } from "../mock-utils";

const MOCK_IMAGES: { file: string; format: ImageFormat }[] = [
  { file: "mock-1.webp", format: "webp" },
  { file: "mock-2.jpg", format: "jpeg" },
  { file: "mock-3.png", format: "png" },
];

export class MockImage extends BaseProvider<ImageGenerateParams, ImageResult> {
  async generate(params: ImageGenerateParams): Promise<ImageResult> {
    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000));
    const pick = MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)];
    const data = readMockFile(pick.file).toString("base64");
    return {
      data,
      format: pick.format,
      width: params.width ?? 512,
      height: params.height ?? 512,
    };
  }
}
