import { HttpAnimatedImageConnector } from "./animated_image/connector";
import { HttpImageConnector } from "./image/connector";
import { HttpLLMConnector } from "./llm/connector";
import { HttpMusicConnector } from "./music/connector";
import { HttpSFXConnector } from "./sfx/connector";
import { HttpTTSConnector } from "./tts/connector";
import { HttpVideoConnector } from "./video/connector";
import type { AttributeSchema } from "./attributes/schema";
import { MODEL_CATALOGS } from "./models";
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
	music: HttpMusicConnector;
	sfx: HttpSFXConnector;
	image: HttpImageConnector;
	animated_image: HttpAnimatedImageConnector;
	tts: TTSConnector;
	video: HttpVideoConnector;
};

/**
 * The connector serving each type. One class covers every provider of that
 * type: a generation reaches the same routes either way, and which family it
 * posts to follows from the provider the config carries.
 */
const CONNECTORS: Record<ConnectorType, ProviderConstructor> = {
	llm: HttpLLMConnector,
	music: HttpMusicConnector,
	sfx: HttpSFXConnector,
	image: HttpImageConnector,
	animated_image: HttpAnimatedImageConnector,
	tts: HttpTTSConnector,
	video: HttpVideoConnector,
};

/**
 * The class that serves a (type, provider). The catalog decides who is on the
 * list: a provider serves a type exactly when it has models there, so wiring a
 * model in is all it takes to make its provider reachable.
 */
function providerCtor(
	type: ConnectorType,
	provider: ProviderKey,
): ProviderConstructor {
	if (!MODEL_CATALOGS[type].providers.includes(provider))
		throw new Error(`Unknown provider "${provider}" for type "${type}"`);
	return CONNECTORS[type];
}

export function createConnector<T extends ConnectorType>(
	type: T,
	provider: ProviderKey,
	config: ConnectorConfig,
): ConnectorTypeMap[T] {
	return new (providerCtor(type, provider))({
		...config,
		provider,
	}) as ConnectorTypeMap[T];
}

/** Resolve the attribute schema for a (connectorType, provider, model), via the same class hierarchy `createConnector` instantiates. */
export function resolveAttributeSchema(
	type: ConnectorType,
	provider: ProviderKey,
	model?: string,
): AttributeSchema {
	return providerCtor(type, provider).attributesFor(model);
}
