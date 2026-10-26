import type { Caption } from "@remotion/captions";
import { z } from "zod";
import type { CanvasElement } from "@/lib/canvas/types";
import type { Dependency, Read } from "@/lib/generation/declare";
import type { WithMetadata } from "@/lib/providers/base";
import type { MediaResolution } from "@/lib/project/aspect-ratio";
import type { CharacterSchema } from "@/lib/api/request-schema-fields";
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
	"voice",
	"stt",
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
	description?: string;
};

/** A visual model also says which resolutions the vendor renders it at, its default first. */
export type VisualModelEntry = ModelEntry & {
	resolutions: readonly [MediaResolution, ...MediaResolution[]];
};

/** What each connector type's catalog entries carry. */
export type ModelEntries = {
	llm: ModelEntry;
	tts: ModelEntry;
	voice: ModelEntry;
	image: VisualModelEntry;
	video: VisualModelEntry;
	sfx: ModelEntry;
	music: ModelEntry;
	stt: ModelEntry;
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
	/** Keyed by the label each plugin declared them under. */
	dependencies?: Record<string, AssetResult>;
	/** What the node's plugins read, as its inputs recorded it. */
	reads?: Record<string, string>;
	/** Aborts when the caller cancels the generation. */
	signal?: AbortSignal;
}

export interface ConnectorPlugin<TParams = unknown, TResult = unknown> {
	name: string;
	dependencies?: readonly Dependency[];
	/** The model the element generates on, when it is picked somewhere other than the element. */
	model?(element: CanvasElement, canvas: CanvasElement[]): ModelPick;
	reads?: readonly Read[];
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

/** Remotion's caption, holding one word as its provider spelled it, never padded with spaces. */
export const CaptionSchema = z.object({
	text: z
		.string()
		.min(1, "A caption holds no word")
		.refine((text) => text === text.trim(), "A caption is never padded"),
	startMs: z.number(),
	endMs: z.number(),
	timestampMs: z.number().nullable(),
	confidence: z.number().nullable(),
}) satisfies z.ZodType<Caption>;

/** Words saved in an older shape load as none, so the clip opens uncaptioned. */
const WordsSchema = z.array(CaptionSchema).optional().catch(undefined);

export const AssetResultSchema = z.object({
	durationSec: z.number(),
	imageUrl: z.string().optional(),
	audioUrl: z.string().optional(),
	videoUrl: z.string().optional(),
	textTimestamps: WordsSchema,
	/** The words as generated, which a reset brings back. */
	originalTextTimestamps: WordsSchema,
	voiceId: z.string().optional(),
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

export const LLMStreamChunkSchema = z.object({
	text: z.string(),
	done: z.boolean(),
});

export type LLMStreamChunk = z.infer<typeof LLMStreamChunkSchema>;

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

export type Character = z.infer<typeof CharacterSchema>;

export type ImageGenerateParams = ConnectorGenerateParams & {
	format?: ImageFormat;
	resolution?: MediaResolution;
	width?: number;
	height?: number;
	characterAssets?: Character[];
	referenceImages?: string[];
};

export type TTSGenerateParams = ConnectorGenerateParams & {
	voiceId?: string;
	name?: string;
	speed?: TTSSpeed;
	emotion?: TTSEmotion;
	format?: string;
};

/** The sound to turn into text, which the server requires. */
export type STTGenerateParams = ConnectorGenerateParams & {
	mediaUrl?: string;
};

export type SourcedSTTParams = STTGenerateParams & {
	mediaUrl: string;
};

export type STTResult = Pick<AssetResult, "durationSec"> & {
	textTimestamps: Caption[];
};

export type TTSResult = AssetResult &
	STTResult & { originalTextTimestamps: Caption[] };

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
	voicePreview(voiceId: string): Promise<HostedVoicePreview>;
}

export type VideoGenerateParams = ConnectorGenerateParams & {
	characterAssets?: Character[];
	referenceImages?: string[];
	/** The previous scene's opening and middle, which this one carries on from. */
	continuityFrames?: string[];
	frameImage?: string;
	duration?: number;
	resolution?: MediaResolution;
	width?: number;
	height?: number;
};

export interface ProviderConstructor<T extends Connector = Connector> {
	new (config: ResolvedConnectorConfig): T;
	attributesFor(model: ModelRef): AttributeSchema;
}
