import { z } from "zod";
import type {
	AssetType,
	GeneratedElement,
	CanvasElement,
} from "@/lib/canvas/types";
import type { DependencyResults } from "@/lib/generation/dependency";
import type { BuildContext } from "@/lib/generation/graph";
import type { WithMetadata } from "@/lib/providers/base";
import type { VideoResolution } from "@/lib/project/aspectRatio";
import type { AttributeSchema } from "./attributes/schema";
import type { ImageFormat } from "./image/enums";
import type { ThinkingLevel } from "./llm/enums";
import type { TTSEmotion, TTSGender, TTSSpeed } from "./tts/enums";

export const ASSET_CONNECTOR_TYPES = [
	"music",
	"sfx",
	"image",
	"tts",
	"video",
] as const;

export type AssetConnectorType = (typeof ASSET_CONNECTOR_TYPES)[number];

export const CONNECTOR_TYPES = [...ASSET_CONNECTOR_TYPES, "llm"] as const;

export type ConnectorType = AssetConnectorType | "llm";

export const PROVIDERS = [
	"openslop",
	"anthropic",
	"runware",
	"cartesia",
	"elevenlabs",
] as const;

export type Provider = (typeof PROVIDERS)[number];

/** How a model trades off against its siblings. Relative within a connector type, never absolute. */
export type Tier = "low" | "medium" | "high";

export type ModelMeta = {
	/** What a generation costs. Lower is cheaper. */
	cost: Tier;
	/** How quickly it returns. Higher is faster. */
	speed: Tier;
};

export type ModelEntry = ModelMeta & {
	/** The id the provider's own API takes. */
	id: string;
};

/** A video model also says which output resolutions the vendor renders it at, and whether it listens to reference audio. */
export type VideoModelEntry = ModelEntry & {
	resolutions: readonly VideoResolution[];
	referenceAudios?: true;
};

/** What each connector type's catalog entries carry. */
export type ModelEntries = {
	llm: ModelEntry;
	tts: ModelEntry;
	image: ModelEntry;
	video: VideoModelEntry;
	sfx: ModelEntry;
	music: ModelEntry;
};

export type ModelTable = Record<string, ModelEntry>;

export type ModelsByProvider<E extends ModelEntry = ModelEntry> = Partial<
	Record<Provider, Record<string, E>>
>;

/** Names are only unique within a provider, so the pair is the identity everywhere. */
export type ModelRef = { provider: Provider; model: string };

export type ModelPick = { provider?: string; model?: string };

/** A voice's preview at a URL anyone can fetch, and how long it plays. */
export const HostedVoicePreviewSchema = z.object({
	url: z.url({ error: "A hosted preview needs an HTTP(S) URL" }),
	durationSec: z
		.number()
		.positive({ error: "A hosted preview must say how long it plays" }),
});

export type HostedVoicePreview = z.infer<typeof HostedVoicePreviewSchema>;

export interface PluginContext {
	/** Read through the handles that declared them. */
	dependencies?: DependencyResults;
	/** What the node's plugins read, as its inputs recorded it. */
	reads?: Record<string, string>;
	/** Aborts when the caller cancels the generation. */
	signal?: AbortSignal;
}

/** Attributes to write onto an asset before generating, adding it when there is none. */
export type AssetWrite = {
	type: AssetType;
	name?: string;
	attrs: Record<string, string>;
};

export interface ConnectorPlugin<TParams = unknown, TResult = unknown> {
	name: string;
	/**
	 * Declaring a node is what makes the element wait for it, go stale with it
	 * and receive its result; an undeclared read goes stale-blind.
	 */
	dependencies?(
		element: CanvasElement,
		ctx: BuildContext,
	): Record<string, GeneratedElement>;
	/**
	 * The model the element generates on, for a type whose model is picked
	 * somewhere other than the element itself.
	 */
	model?(element: CanvasElement, canvas: CanvasElement[]): ModelRef;
	/** Values the node reads off the canvas or the settings, recorded in its inputs so a change stales it. */
	reads?(element: CanvasElement, ctx: BuildContext): Record<string, string>;
	/** Assets to write before the node is built to run, such as the voice a search found. */
	prepare?(element: CanvasElement, ctx: BuildContext): Promise<AssetWrite[]>;
	beforeGenerate?(
		params: TParams,
		ctx: PluginContext,
	): TParams | Promise<TParams>;
	afterGenerate?(
		result: TResult,
		ctx: PluginContext,
	): TResult | Promise<TResult>;
	transformPrompt?(
		prompt: string,
		ctx: PluginContext,
	): string | Promise<string>;
	onError?(error: string, ctx: PluginContext): void | Promise<void>;
}

export interface ConnectorConfig {
	plugins?: ConnectorPlugin[];
}

export type ResolvedConnectorConfig = ConnectorConfig & { model: ModelRef };

/**
 * The connector stamps its own model onto every generation, so a caller only
 * supplies what varies per call.
 */
export type ConnectorGenerateParams = Partial<ModelRef> & { prompt: string };

const TextTimestampSchema = z.object({
	text: z.string(),
	start: z.number(),
	end: z.number(),
});

export type TextTimestamp = z.infer<typeof TextTimestampSchema>;

export const AssetResultSchema = z.object({
	durationSec: z.number(),
	imageUrl: z.string().optional(),
	audioUrl: z.string().optional(),
	videoUrl: z.string().optional(),
	textTimestamps: z.array(TextTimestampSchema).optional(),
});

export type AssetResult = z.infer<typeof AssetResultSchema>;

export interface Connector {
	readonly type: ConnectorType;
	generate(params: ConnectorGenerateParams): Promise<unknown>;
}

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

export type MusicGenerateParams = ConnectorGenerateParams & {
	durationSeconds?: number;
};

export type SFXGenerateParams = ConnectorGenerateParams & {
	durationSeconds?: number;
};

export type ImageGenerateParams = ConnectorGenerateParams & {
	format?: ImageFormat;
	width?: number;
	height?: number;
	referenceImages?: string[];
};

export type TTSResult = AssetResult & {
	textTimestamps: TextTimestamp[];
};

export type TTSGenerateParams = ConnectorGenerateParams & {
	voiceId?: string;
	name?: string;
	speed?: TTSSpeed;
	emotion?: TTSEmotion;
	format?: string;
};

/** A TTS request after its speaker's voice is resolved. */
export type VoicedTTSParams = TTSGenerateParams & { voiceId: string };

export type VoiceInfo = {
	id: string;
	name: string;
	language?: string;
	gender?: TTSGender;
	accent?: string;
	description: string;
	/** Where the vendor keeps the voice's preview, behind its key; hear it through `voicePreview`. */
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
	voicePreview(voiceId: string): Promise<HostedVoicePreview | undefined>;
}

/** Audio a video's speech should sound like, and whose voice it is. */
export const ReferenceAudioSchema = HostedVoicePreviewSchema.extend({
	speaker: z
		.string()
		.min(1, { error: "A reference audio must name its speaker" }),
});

export type ReferenceAudio = z.infer<typeof ReferenceAudioSchema>;

export type VideoGenerateParams = ConnectorGenerateParams & {
	referenceImages?: string[];
	frameImage?: string;
	referenceAudios?: ReferenceAudio[];
	duration?: number;
	resolution?: VideoResolution;
	width?: number;
	height?: number;
};

export interface ProviderConstructor<T extends Connector = Connector> {
	new (config: ResolvedConnectorConfig): T;
	attributesFor(model: ModelRef): AttributeSchema;
}
