import { BaseConnector } from "../base";
import type {
  TTSConnector,
  TTSGenerateParams,
  TTSResult,
  VoiceInfo,
  VoiceSearchParams,
} from "../types";

export abstract class BaseTTSConnector
  extends BaseConnector<TTSGenerateParams, TTSResult>
  implements TTSConnector
{
  readonly type = "tts" as const;

  protected abstract _generate(params: TTSGenerateParams): Promise<TTSResult>;

  abstract searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]>;
}
