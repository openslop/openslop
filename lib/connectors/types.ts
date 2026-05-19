import type { GatewayClient } from "@/lib/gateway/base";
import type { WithMetadata } from "@/lib/providers/base";
import type { TTSGender, TTSSpeed } from "./tts/enums";

export type ConnectorType =
	| "llm"
	| "music"
	| "sfx"
	| "image"
	| "animated_image"
	| "tts"
	| "video";

export type ProviderKey = "openslop";

export type VoiceSearchFn = (params: VoiceSearchParams) => Promise<VoiceInfo[]>;

export interface PluginContext<TParams = unknown, TResult = unknown> {
	gateway?: GatewayClient<TParams, TResult>;
	searchVoices?: VoiceSearchFn;
	data?: Record<string, unknown>;
}

export interface ConnectorPlugin<TParams = unknown, TResult = unknown> {
	name: string;
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
	options?: Record<string, unknown>;
}

export type ConnectorGenerateParams = {
	prompt: string;
	model?: string;
};

export type AssetResult = {
	url: string;
	durationSec: number;
	previewUrl?: string;
	textTimestamps?: TextTimestamp[];
};

export interface Connector {
	readonly type: ConnectorType;
	generate(params: ConnectorGenerateParams): Promise<unknown>;
	init(): Promise<void>;
	validate(): Promise<boolean>;
	destroy(): Promise<void>;
}

// LLM types

export type LLMGenerateParams = ConnectorGenerateParams & {
	systemPrompt?: string;
	thinkingLevel?: string;
	maxTokens?: number;
	temperature?: number;
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
	stream(params: LLMGenerateParams): AsyncGenerator<LLMStreamChunk>;
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

export type AnimatedImageGenerateParams = ImageGenerateParams & {
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
	volume?: number;
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

export type LLMPlugin = ConnectorPlugin<LLMGenerateParams, LLMGenerateResult>;

export type ProviderConstructor<T extends Connector = Connector> = new (
	config: ConnectorConfig,
) => T;
