import type { BaseImageConnector } from "./image/connector";
import { OpenSlopImage } from "./image/openslop";
import type { BaseAnimatedImageConnector } from "./animated_image/connector";
import { OpenSlopAnimatedImage } from "./animated_image/openslop";
import { OpenSlopLLM } from "./llm/openslop";
import type { BaseMusicConnector } from "./music/connector";
import { OpenSlopMusic } from "./music/openslop";
import type { BaseSFXConnector } from "./sfx/connector";
import { OpenSlopSFX } from "./sfx/openslop";
import { OpenSlopTTS } from "./tts/openslop";
import type { BaseVideoConnector } from "./video/connector";
import { OpenSlopVideo } from "./video/openslop";
import type {
	ConnectorConfig,
	ConnectorType,
	LLMConnector,
	ProviderConstructor,
	ProviderKey,
	TTSConnector,
} from "./types";

type ConnectorTypeMap = {
	llm: LLMConnector;
	music: BaseMusicConnector;
	sfx: BaseSFXConnector;
	image: BaseImageConnector;
	animated_image: BaseAnimatedImageConnector;
	tts: TTSConnector;
	video: BaseVideoConnector;
};

const PROVIDERS: Record<
	ConnectorType,
	Record<ProviderKey, ProviderConstructor>
> = {
	llm: { openslop: OpenSlopLLM },
	music: { openslop: OpenSlopMusic },
	sfx: { openslop: OpenSlopSFX },
	image: { openslop: OpenSlopImage },
	animated_image: { openslop: OpenSlopAnimatedImage },
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
