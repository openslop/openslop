import type { BaseProvider } from "@/lib/providers/base";
import { BaseConnector } from "../base";
import type {
  ImageConnector,
  ImageGenerateParams,
  ImageResult,
} from "../types";

export abstract class BaseImageConnector<
  TProvider extends BaseProvider<ImageGenerateParams, ImageResult> =
    BaseProvider<ImageGenerateParams, ImageResult>,
>
  extends BaseConnector<ImageGenerateParams, ImageResult, TProvider>
  implements ImageConnector
{
  readonly type = "image" as const;
}
