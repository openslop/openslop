import { BaseConnector } from "../base";
import type {
  AudioResult,
  MusicConnector,
  MusicGenerateParams,
} from "../types";

export abstract class BaseMusicConnector
  extends BaseConnector<MusicGenerateParams, AudioResult>
  implements MusicConnector
{
  readonly type = "music" as const;

  protected abstract _generate(
    params: MusicGenerateParams,
  ): Promise<AudioResult>;
}
