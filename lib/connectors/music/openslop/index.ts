import { BaseMusicConnector } from "../connector";
import type {
  AudioResult,
  ModelInfo,
  MusicGenerateParams,
} from "@/lib/connectors/types";

export class OpenSlopMusic extends BaseMusicConnector {
  async listModels(): Promise<ModelInfo[]> {
    return [{ id: "openslop-default", name: "OpenSlop Default" }];
  }

  protected async _generate(params: MusicGenerateParams): Promise<AudioResult> {
    return {
      data: new ArrayBuffer(0),
      format: params.format ?? "mp3",
      durationSeconds: params.durationSeconds ?? 30,
    };
  }
}
