import { BaseSFXConnector } from "../connector";
import type {
  AudioResult,
  ModelInfo,
  SFXGenerateParams,
} from "@/lib/connectors/types";

export class OpenSlopSFX extends BaseSFXConnector {
  async listModels(): Promise<ModelInfo[]> {
    return [{ id: "openslop-default", name: "OpenSlop Default" }];
  }

  protected async _generate(params: SFXGenerateParams): Promise<AudioResult> {
    return {
      data: new ArrayBuffer(0),
      format: params.format ?? "mp3",
      durationSeconds: params.durationSeconds ?? 5,
    };
  }
}
