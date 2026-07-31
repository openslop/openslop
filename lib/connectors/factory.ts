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
import type { AttributeSchema } from "./attributes/schema";
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

function providerCtor(
	type: ConnectorType,
	provider: ProviderKey,
): ProviderConstructor {
	const Ctor = PROVIDERS[type][provider];
	if (!Ctor)
		throw new Error(`Unknown provider "${provider}" for type "${type}"`);
	return Ctor;
}

export function createConnector<T extends ConnectorType>(
	type: T,
	provider: ProviderKey,
	config: ConnectorConfig,
): ConnectorTypeMap[T] {
	return new (providerCtor(type, provider))(config) as ConnectorTypeMap[T];
}

/** Resolve the attribute schema for a (connectorType, provider, model), via the same class hierarchy `createConnector` instantiates. */
export function resolveAttributeSchema(
	type: ConnectorType,
	provider: ProviderKey,
	model?: string,
): AttributeSchema {
	return providerCtor(type, provider).attributesFor(model);
}
