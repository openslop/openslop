import { HttpAnimatedImageConnector } from "./animated_image/connector";
import { HttpImageConnector } from "./image/connector";
import { HttpLLMConnector } from "./llm/connector";
import { HttpMusicConnector } from "./music/connector";
import { HttpSFXConnector } from "./sfx/connector";
import { HttpTTSConnector } from "./tts/connector";
import { HttpVideoConnector } from "./video/connector";
import type { AttributeSchema } from "./attributes/schema";
import type {
	ConnectorConfig,
	ConnectorType,
	LLMConnector,
	ModelRef,
	ProviderConstructor,
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

export function createConnector<T extends ConnectorType>(
	type: T,
	model: ModelRef,
	config: ConnectorConfig,
): ConnectorTypeMap[T] {
	return new CONNECTORS[type]({
		...config,
		model: { provider: model.provider, model: model.model },
	}) as ConnectorTypeMap[T];
}

export function resolveAttributeSchema(
	type: ConnectorType,
	model: ModelRef,
): AttributeSchema {
	return CONNECTORS[type].attributesFor(model);
}
