import type {
  VideoGenerateParams,
  VideoJob,
  VideoJobMetadata,
} from "@/lib/connectors/types";
import type { BundleFile, BundleResponse } from "@/lib/api/asset-bundle";
import { BaseProvider } from "../base";

export type VideoProviderResponse = BundleResponse & {
  metadata?: VideoJobMetadata;
};

export interface VideoProvider {
  generate(params: VideoGenerateParams): Promise<VideoProviderResponse>;
  poll(jobId: string): Promise<VideoProviderResponse>;
}

export abstract class BaseVideoProvider extends BaseProvider<
  VideoGenerateParams,
  VideoJob,
  VideoProviderResponse
> {
  protected toFiles(r: VideoJob): BundleFile[] {
    return r.url ? [{ key: "video", url: r.url }] : [];
  }

  protected abstract _poll(jobId: string): Promise<VideoJob>;

  async poll(jobId: string): Promise<VideoProviderResponse> {
    const result = await this._poll(jobId);
    if (this.toFiles(result).length === 0) {
      return {
        id: "",
        provider: this.blobConfig.provider,
        result: {},
        metadata: result.metadata,
      };
    }
    return this.store(result);
  }
}
