import type { BaseProvider } from "@/lib/providers/base";

export type ConnectorType = "llm" | "music" | "sfx" | "image" | "tts" | "video";

export type ProviderKey = "openslop";

export type ImageFormat = "png" | "jpeg" | "webp";

export type ModelInfo = {
  id: string;
  name: string;
  description?: string;
};

export interface PluginContext<TParams = unknown, TResult = unknown> {
  provider: BaseProvider<TParams, TResult>;
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
    error: Error,
    ctx?: PluginContext<TParams, TResult>,
  ): void | Promise<void>;
}

export interface ConnectorConfig {
  provider: string;
  apiKey: string;
  baseUrl?: string;
  plugins?: ConnectorPlugin[];
  options?: Record<string, unknown>;
}

export interface Connector {
  readonly type: ConnectorType;
  init(): Promise<void>;
  validate(): Promise<boolean>;
  destroy(): Promise<void>;
  listModels(): Promise<ModelInfo[]>;
}

// LLM types

export type LLMGenerateParams = {
  prompt: string;
  model?: string;
  systemPrompt?: string;
  thinkingLevel?: string;
  maxTokens?: number;
  temperature?: number;
};

export type LLMGenerateResult = {
  text: string;
  model: string;
  usage?: { inputTokens: number; outputTokens: number };
};

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

export type MusicGenerateParams = {
  prompt: string;
  model?: string;
  durationSeconds?: number;
};

export interface MusicConnector extends Connector {
  readonly type: "music";
  generate(params: MusicGenerateParams): Promise<ArrayBuffer>;
}

// SFX types

export type SFXGenerateParams = {
  prompt: string;
  model?: string;
  durationSeconds?: number;
};

export interface SFXConnector extends Connector {
  readonly type: "sfx";
  generate(params: SFXGenerateParams): Promise<ArrayBuffer>;
}

// Image types

export type ImageGenerateParams = {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  format?: ImageFormat;
  referenceImage?: string;
};

export type ImageResult = {
  data: string;
  format: ImageFormat;
  width: number;
  height: number;
};

export interface ImageConnector extends Connector {
  readonly type: "image";
  generate(params: ImageGenerateParams): Promise<ImageResult>;
}

// TTS types

export type TextTimestamp = { text: string; start: number; end: number };

export type TTSResult = {
  data: string;
  textTimestamps: TextTimestamp[];
};

export type TTSGenerateParams = {
  prompt: string;
  voiceId: string;
  model?: string;
  speed?: number | string;
  volume?: number;
  format?: string;
};

export type VoiceInfo = {
  id: string;
  name: string;
  language?: string;
  gender?: string;
  accent?: string;
  description?: string;
  previewUrl?: string;
};

export type VoiceSearchParams = {
  query?: string;
  gender?: string;
  accent?: string;
  language?: string;
};

export interface TTSConnector extends Connector {
  readonly type: "tts";
  generate(params: TTSGenerateParams): Promise<TTSResult>;
  searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]>;
}

// Video types

export type VideoGenerateParams = {
  prompt: string;
  model?: string;
  referenceImage?: string;
  duration?: number;
  width?: number;
  height?: number;
};

export type VideoJobStatus = "queued" | "processing" | "completed" | "failed";

export type VideoJob = {
  jobId: string;
  status: VideoJobStatus;
  resultUrl?: string;
  error?: string;
  progress?: number;
};

export interface VideoConnector extends Connector {
  readonly type: "video";
  generate(params: VideoGenerateParams): Promise<VideoJob>;
  poll(jobId: string): Promise<VideoJob>;
}

// Plugin type aliases

export type LLMPlugin = ConnectorPlugin<LLMGenerateParams, LLMGenerateResult>;
export type MusicPlugin = ConnectorPlugin<MusicGenerateParams, ArrayBuffer>;
export type SFXPlugin = ConnectorPlugin<SFXGenerateParams, ArrayBuffer>;
export type ImagePlugin = ConnectorPlugin<ImageGenerateParams, ImageResult>;
export type TTSPlugin = ConnectorPlugin<TTSGenerateParams, TTSResult>;
export type VideoPlugin = ConnectorPlugin<VideoGenerateParams, VideoJob>;

// Factory types

export type ConnectorTypeMap = {
  llm: LLMConnector;
  music: MusicConnector;
  sfx: SFXConnector;
  image: ImageConnector;
  tts: TTSConnector;
  video: VideoConnector;
};

export type ProviderConstructor<T extends Connector = Connector> = new (
  config: ConnectorConfig,
) => T;
