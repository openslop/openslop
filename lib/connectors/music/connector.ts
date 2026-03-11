import { BaseConnector } from "../base";
import type { MusicConnector, MusicGenerateParams } from "../types";

export abstract class BaseMusicConnector
  extends BaseConnector<MusicGenerateParams, ArrayBuffer>
  implements MusicConnector
{
  readonly type = "music" as const;

  protected abstract _generate(
    params: MusicGenerateParams,
  ): Promise<ArrayBuffer>;
}
