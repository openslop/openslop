import { BaseConnector } from "../base";
import type { AudioResult, SFXConnector, SFXGenerateParams } from "../types";

export abstract class BaseSFXConnector
  extends BaseConnector<SFXGenerateParams, AudioResult>
  implements SFXConnector
{
  readonly type = "sfx" as const;

  protected abstract _generate(params: SFXGenerateParams): Promise<AudioResult>;
}
