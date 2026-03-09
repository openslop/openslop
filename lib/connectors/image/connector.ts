import { BaseConnector } from "../base";
import type {
  ImageConnector,
  ImageGenerateParams,
  ImageResult,
} from "../types";

export abstract class BaseImageConnector
  extends BaseConnector<ImageGenerateParams, ImageResult>
  implements ImageConnector
{
  readonly type = "image" as const;

  protected abstract _generate(
    params: ImageGenerateParams,
  ): Promise<ImageResult>;
}
