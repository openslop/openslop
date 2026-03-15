import type { SFXGenerateParams } from "@/lib/connectors/types";
import { BaseOpenSlopProvider } from "../openslop-base";

export class OpenSlopSFX extends BaseOpenSlopProvider<
  SFXGenerateParams,
  ArrayBuffer
> {
  async generate(params: SFXGenerateParams): Promise<ArrayBuffer> {
    return this.client.postBinary("/api/v1/sfx", params);
  }
}
