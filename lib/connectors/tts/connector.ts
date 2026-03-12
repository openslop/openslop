import type { BaseProvider } from "@/lib/providers/base";
import { BaseConnector } from "../base";
import type {
  TTSConnector,
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
}
