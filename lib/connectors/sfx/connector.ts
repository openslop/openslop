import { BaseConnector } from "../base";
import type { SFXConnector, SFXGenerateParams } from "../types";

export abstract class BaseSFXConnector
  extends BaseConnector<SFXGenerateParams, ArrayBuffer>
  implements SFXConnector
{
  readonly type = "sfx" as const;

  protected abstract _generate(params: SFXGenerateParams): Promise<ArrayBuffer>;
}
