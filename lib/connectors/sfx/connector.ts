import type { BaseProvider } from "@/lib/providers/base";
import { BaseConnector } from "../base";
import type { SFXConnector, SFXGenerateParams } from "../types";

export abstract class BaseSFXConnector<
  TProvider extends BaseProvider<SFXGenerateParams, ArrayBuffer> = BaseProvider<
    SFXGenerateParams,
    ArrayBuffer
  >,
>
  extends BaseConnector<SFXGenerateParams, ArrayBuffer, TProvider>
  implements SFXConnector
{
  readonly type = "sfx" as const;
}
