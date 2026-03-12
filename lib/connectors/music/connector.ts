import type { BaseProvider } from "@/lib/providers/base";
import { BaseConnector } from "../base";
import type { MusicConnector, MusicGenerateParams } from "../types";

export abstract class BaseMusicConnector<
  TProvider extends BaseProvider<MusicGenerateParams, ArrayBuffer> =
    BaseProvider<MusicGenerateParams, ArrayBuffer>,
>
  extends BaseConnector<MusicGenerateParams, ArrayBuffer, TProvider>
  implements MusicConnector
{
  readonly type = "music" as const;
}
