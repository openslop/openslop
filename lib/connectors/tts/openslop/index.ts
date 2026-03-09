import { BaseTTSConnector } from "../connector";
import type {
  AudioResult,
  ModelInfo,
  TTSGenerateParams,
  VoiceInfo,
  VoiceSearchParams,
} from "@/lib/connectors/types";

export class OpenSlopTTS extends BaseTTSConnector {
  async listModels(): Promise<ModelInfo[]> {
    return [{ id: "openslop-default", name: "OpenSlop Default" }];
  }

  protected async _generate(params: TTSGenerateParams): Promise<AudioResult> {
    return {
      data: new ArrayBuffer(0),
      format: params.format ?? "mp3",
      durationSeconds: 1,
    };
  }

  async searchVoices(_params: VoiceSearchParams): Promise<VoiceInfo[]> {
    return [
      {
        id: "openslop-voice",
        name: "OpenSlop Default Voice",
        language: "en",
        gender: "neutral",
      },
    ];
  }
}
