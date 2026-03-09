import { BaseConnector } from "../base";
import type {
  AudioResult,
  TTSConnector,
  TTSGenerateParams,
  VoiceInfo,
  VoiceSearchParams,
} from "../types";

export abstract class BaseTTSConnector
  extends BaseConnector<TTSGenerateParams, AudioResult>
  implements TTSConnector
{
  readonly type = "tts" as const;

  protected abstract _generate(params: TTSGenerateParams): Promise<AudioResult>;

  abstract searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]>;
}
