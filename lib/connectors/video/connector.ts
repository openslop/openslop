import { AssetBundle } from "@/lib/api/asset-bundle";
import { BaseAssetConnector } from "../asset-base";
import type {
  AssetResult,
  VideoConnector,
  VideoGenerateParams,
} from "../types";
import type { VideoProvider } from "@/lib/providers/video/base";
import { awaitCompletion } from "@/lib/providers/poll";

export abstract class BaseVideoConnector
  extends BaseAssetConnector<VideoGenerateParams, AssetResult>
  implements VideoConnector
{
  readonly type = "video" as const;
  readonly assetKey = "video" as const;

  protected abstract gateway: VideoProvider;

  protected async _generate(params: VideoGenerateParams): Promise<AssetResult> {
    const response = await this.gateway.generate(params);

    if (response.result?.[this.assetKey]) {
      return this.resolveBundle(AssetBundle.fromResponse(this.type, response));
    }

    const jobId = response.metadata?.jobId;
    if (!jobId) {
      throw new Error("Video provider returned no jobId for async generation");
    }

    const completed = await awaitCompletion(
      (id) => this.gateway.poll(id),
      jobId,
      (r) => !!r.result?.[this.assetKey] || r.metadata?.status === "failed",
    );

    if (completed.metadata?.status === "failed") {
      const error = completed.metadata?.error ?? "Video generation failed";
      throw new Error(error);
    }

    const bundle = AssetBundle.fromResponse(this.type, completed);
    return this.resolveBundle(bundle);
  }
}
