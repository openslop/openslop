import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { VideoGenerateParams } from "@/lib/connectors/types";
import { BaseProvider } from "../base";

export class MockVideo extends BaseProvider<
  VideoGenerateParams,
  BundleResponse
> {
  async generate(): Promise<BundleResponse> {
    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000));
    return { id: "1", provider: "mock", result: { video: "output.mp4" } };
  }
}
