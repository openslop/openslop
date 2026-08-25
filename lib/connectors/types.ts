import type { CanvasContentElement } from "@/lib/canvas/types";
import type { GatewayClient } from "@/lib/gateway/base";
import type { NodeSpec } from "@/lib/generation/graph";
import type { ProjectData } from "@/lib/project/store";
import type { WithMetadata } from "@/lib/providers/base";
import type { AttributeSchema } from "./attributes/schema";
import type { ThinkingLevel } from "./llm/enums";
import type { TTSEmotion, TTSGender, TTSSpeed } from "./tts/enums";

export const ASSET_CONNECTOR_TYPES = [
	"music",
	"sfx",
	"image",
	"animated_image",
	"tts",
	"video",
] as const;

export type AssetConnectorType = (typeof ASSET_CONNECTOR_TYPES)[number];

export type ConnectorType = AssetConnectorType | "llm";

export type ProviderKey = "openslop";

/** Derived nodes have no settings UI to pin a provider, so they take this one. */
export const DEFAULT_PROVIDER: ProviderKey = "openslop";

export type VoiceSearchFn = (params: VoiceSearchParams) => Promise<VoiceInfo[]>;

export interface PluginContext<TParams = unknown, TResult = unknown> {
	gateway?: GatewayClient<TParams, TResult>;
	searchVoices?: VoiceSearchFn;
	data?: Record<string, unknown>;
	/** Id of the node being generated. */
	elementId?: string;
	/** Outputs of that node's dependencies, keyed by node id. */
	dependencies?: Record<string, AssetResult>;
	/** The project state the node's inputs were resolved against. */
	state?: ProjectData;
}

/** The parts of a plugin context the caller supplies per generation. */
export type GenerationContext = Pick<
	PluginContext,
	"elementId" | "dependencies" | "state"
>;

export interface ConnectorPlugin<TParams = unknown, TResult = unknown> {
	name: string;
	/**
	 * What this plugin reads. Declaring it is what makes the read participate in
	 * ordering and staleness; reading anything undeclared goes stale-blind.
	 */
	dependencies?(element: CanvasContentElement): NodeSpec[];
	beforeGenerate?(
		params: TParams,
		ctx?: PluginContext<TParams, TResult>,
	): TParams | Promise<TParams>;
	afterGenerate?(
		result: TResult,
		ctx?: PluginContext<TParams, TResult>,
	): TResult | Promise<TResult>;
	transformPrompt?(
		prompt: string,
		ctx?: PluginContext<TParams, TResult>,
	): string | Promise<string>;
	onError?(
		error: string,
		ctx?: PluginContext<TParams, TResult>,
	): void | Promise<void>;
}

export interface ConnectorConfig {
	defaultModel: string;
	models: string[];
	isDefault: boolean;
	apiKey?: string;
	baseUrl?: string;
	plugins?: ConnectorPlugin[];
}

export type ConnectorGenerateParams = {
	prompt: string;
	model?: string;
};

export type AssetResult = {
	durationSec: number;
	imageUrl?: string;
	audioUrl?: string;
	videoUrl?: string;
	textTimestamps?: TextTimestamp[];
};

export interface Connector {
	readonly type: ConnectorType;
	generate(params: ConnectorGenerateParams): Promise<unknown>;
}

// LLM types

export type LLMGenerateParams = ConnectorGenerateParams & {
	systemPrompt?: string;
	thinkingLevel?: ThinkingLevel;
	maxTokens?: number;
	temperature?: number;
	referenceImages?: string[];
};

export type LLMGenerateResult = {
	text: string;
	model: string;
	usage?: { inputTokens: number; outputTokens: number };
} & WithMetadata;

export type LLMStreamChunk = {
	text: string;
	done: boolean;
};

export interface LLMConnector extends Connector {
	readonly type: "llm";
	generate(params: LLMGenerateParams): Promise<LLMGenerateResult>;
	stream(
		params: LLMGenerateParams,
		signal?: AbortSignal,
	): AsyncGenerator<LLMStreamChunk>;
}

// Music types

export type MusicGenerateParams = ConnectorGenerateParams & {
	durationSeconds?: number;
};

// SFX types

export type SFXGenerateParams = ConnectorGenerateParams & {
	durationSeconds?: number;
};

// Image types

export type ImageGenerateParams = ConnectorGenerateParams & {
	format?: string;
	width?: number;
	height?: number;
	referenceImages?: string[];
};

/** A video generation whose conditioning frame comes from the element's still. */
export type AnimatedImageGenerateParams = VideoGenerateParams & {
	videoPrompt?: string;
};

// TTS types

export type TextTimestamp = { text: string; start: number; end: number };

export type TTSResult = AssetResult & {
	textTimestamps: TextTimestamp[];
};

export type TTSGenerateParams = ConnectorGenerateParams & {
	voiceId?: string;
	gender?: TTSGender;
	age?: string;
	pitch?: string;
	accent?: string;
	description?: string;
	name?: string;
	query?: string;
	language?: string;
	speed?: TTSSpeed;
	emotion?: TTSEmotion;
	format?: string;
};

export type VoiceInfo = {
	id: string;
	name: string;
	language?: string;
	gender?: TTSGender;
	accent?: string;
	description: string;
	previewUrl?: string;
};

export type VoiceSearchParams = {
	query?: string;
	gender?: TTSGender;
	age?: string;
	pitch?: string;
	accent?: string;
	description?: string;
	name?: string;
	language?: string;
	limit?: number;
};

export interface TTSConnector extends Connector {
	readonly type: "tts";
	generate(params: TTSGenerateParams): Promise<TTSResult>;
	searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]>;
}

// Video types

export type VideoGenerateParams = ConnectorGenerateParams & {
	referenceImages?: string[];
	frameImages?: string[];
	duration?: number;
	width?: number;
	height?: number;
};

export interface ProviderConstructor<T extends Connector = Connector> {
	new (config: ConnectorConfig): T;
	attributesFor(model?: string): AttributeSchema;
}
