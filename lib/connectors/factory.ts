import type { BaseImageConnector } from "./image/connector";
import { OpenSlopImage } from "./image/openslop";
import { ThirdPartyImage } from "./image/thirdparty";
import type { BaseAnimatedImageConnector } from "./animated_image/connector";
import { OpenSlopAnimatedImage } from "./animated_image/openslop";
import { ThirdPartyAnimatedImage } from "./animated_image/thirdparty";
import { OpenSlopLLM } from "./llm/openslop";
import { ThirdPartyLLM } from "./llm/thirdparty";
import type { BaseMusicConnector } from "./music/connector";
import { OpenSlopMusic } from "./music/openslop";
import { ThirdPartyMusic } from "./music/thirdparty";
import type { BaseSFXConnector } from "./sfx/connector";
import { OpenSlopSFX } from "./sfx/openslop";
import { ThirdPartySFX } from "./sfx/thirdparty";
import { OpenSlopTTS } from "./tts/openslop";
import { ThirdPartyTTS } from "./tts/thirdparty";
import type { BaseVideoConnector } from "./video/connector";
import { OpenSlopVideo } from "./video/openslop";
import { ThirdPartyVideo } from "./video/thirdparty";
import type { AttributeSchema } from "./attributes/schema";
import { MODEL_CATALOGS } from "./models";
import { MANAGED_PROVIDER } from "./providerCatalog";
import {
	CONNECTOR_TYPES,
	type ConnectorConfig,
	type ConnectorType,
	type LLMConnector,
	type ProviderConstructor,
	type ProviderKey,
	type TTSConnector,
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

/** The connector that reaches each type through the models OpenSlop hosts. */
const HOSTED: Record<ConnectorType, ProviderConstructor> = {
	llm: OpenSlopLLM,
	music: OpenSlopMusic,
	sfx: OpenSlopSFX,
	image: OpenSlopImage,
	animated_image: OpenSlopAnimatedImage,
	tts: OpenSlopTTS,
	video: OpenSlopVideo,
};

/** The connector that reaches each type on a key the user brings. */
const THIRD_PARTY: Record<ConnectorType, ProviderConstructor> = {
	llm: ThirdPartyLLM,
	music: ThirdPartyMusic,
	sfx: ThirdPartySFX,
	image: ThirdPartyImage,
	animated_image: ThirdPartyAnimatedImage,
	tts: ThirdPartyTTS,
	video: ThirdPartyVideo,
};

/**
 * Which class serves each (type, provider). The catalog decides who is on the
 * list: a provider serves a type exactly when it has models there, so wiring a
 * model in is all it takes to make its provider selectable.
 */
const PROVIDERS = Object.fromEntries(
	CONNECTOR_TYPES.map((type) => [
		type,
		Object.fromEntries(
			MODEL_CATALOGS[type].providers.map((provider) => [
				provider,
				provider === MANAGED_PROVIDER ? HOSTED[type] : THIRD_PARTY[type],
			]),
		),
	]),
) as Record<ConnectorType, Partial<Record<ProviderKey, ProviderConstructor>>>;

/** Every provider a connector type can be generated with. */
export const providersFor = (type: ConnectorType): ProviderKey[] =>
	Object.keys(PROVIDERS[type]) as ProviderKey[];

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
