import { OpenSlopImage } from "./image/openslop";
import { OpenSlopLLM } from "./llm/openslop";
import { OpenSlopMusic } from "./music/openslop";
import { OpenSlopSFX } from "./sfx/openslop";
import { OpenSlopTTS } from "./tts/openslop";
import { OpenSlopVideo } from "./video/openslop";
import type {
  ConnectorConfig,
  ConnectorType,
  ConnectorTypeMap,
  ProviderConstructor,
  ProviderKey,
} from "./types";

const PROVIDERS: Record<
  ConnectorType,
  Record<ProviderKey, ProviderConstructor>
> = {
  llm: { openslop: OpenSlopLLM },
  music: { openslop: OpenSlopMusic },
  sfx: { openslop: OpenSlopSFX },
  image: { openslop: OpenSlopImage },
  tts: { openslop: OpenSlopTTS },
  video: { openslop: OpenSlopVideo },
};

export function createConnector<T extends ConnectorType>(
  type: T,
  provider: ProviderKey,
  config: ConnectorConfig,
): ConnectorTypeMap[T] {
  const Ctor = PROVIDERS[type][provider];
  if (!Ctor)
    throw new Error(`Unknown provider "${provider}" for type "${type}"`);
  return new Ctor(config) as ConnectorTypeMap[T];
}
