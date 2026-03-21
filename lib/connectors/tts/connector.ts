import type { BaseProvider } from "@/lib/providers/base";
import { BaseConnector } from "../base";
import type {
  TTSConnector,
  TTSConnectorParams,
  TTSGenerateParams,
  TTSResult,
  VoiceInfo,
  VoiceSearchParams,
} from "../types";

export abstract class BaseTTSConnector<
  TProvider extends BaseProvider<TTSGenerateParams, TTSResult> = BaseProvider<
    TTSGenerateParams,
    TTSResult
  >,
>
  extends BaseConnector<TTSGenerateParams, TTSResult, TProvider>
  implements TTSConnector
{
  readonly type = "tts" as const;

  abstract searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]>;

  async generate(params: TTSConnectorParams): Promise<TTSResult> {
    let { voiceId } = params;
    if (!voiceId) {
      const voices = await this.searchVoices({
        query: params.query,
        gender: params.gender,
        accent: params.accent,
        language: params.language,
      });
      if (!voices.length) throw new Error("No matching voice found");
      voiceId = voices[0].id;
    }
    return super.generate({
      prompt: params.prompt,
      voiceId,
      model: params.model,
    });
  }
}
