import type { BaseProvider } from "@/lib/providers/base";

export type ConnectorType = "llm" | "music" | "sfx" | "image" | "tts" | "video";

export type ProviderKey = "openslop";

export type ModelInfo = {
  id: string;
  name: string;
  description?: string;
};

export function modelsFromMap(map: Record<string, string>): ModelInfo[] {
  return Object.entries(map).map(([name, id]) => ({ id, name }));
}

export interface PluginContext<TParams = unknown, TResult = unknown> {
  provider?: BaseProvider<TParams, TResult>;
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
  defaultModel: string;
  models: string[];
  isDefault: boolean;
  apiKey?: string;
  baseUrl?: string;
  plugins?: ConnectorPlugin[];
  options?: Record<string, unknown>;
}

export interface ConnectorGenerateParams {
  prompt: string;
  model?: string;
}

export interface TTSConnectorParams extends ConnectorGenerateParams {
  voiceId?: string;
  gender?: string;
  accent?: string;
  query?: string;
  language?: string;
}

export type AssetResult = { url: string };

export interface Connector {
  readonly type: ConnectorType;
  generate(params: ConnectorGenerateParams): Promise<unknown>;
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
  generate(params: MusicGenerateParams): Promise<AssetResult>;
}

// SFX types

export type SFXGenerateParams = {
  prompt: string;
  model?: string;
  durationSeconds?: number;
};

export interface SFXConnector extends Connector {
  readonly type: "sfx";
  generate(params: SFXGenerateParams): Promise<AssetResult>;
}

// Image types

export type ImageGenerateParams = {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  referenceImage?: string;
};

export interface ImageConnector extends Connector {
  readonly type: "image";
  generate(params: ImageGenerateParams): Promise<AssetResult>;
}

// TTS types

export type TextTimestamp = { text: string; start: number; end: number };

export type TTSResult = AssetResult & {
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
  generate(params: TTSConnectorParams): Promise<TTSResult>;
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
  url?: string;
  error?: string;
  progress?: number;
};

export interface VideoConnector extends Connector {
  readonly type: "video";
  generate(params: VideoGenerateParams): Promise<AssetResult>;
  poll(jobId: string): Promise<VideoJob>;
}

// Plugin type aliases

export type LLMPlugin = ConnectorPlugin<LLMGenerateParams, LLMGenerateResult>;
export type MusicPlugin = ConnectorPlugin<MusicGenerateParams, AssetResult>;
export type SFXPlugin = ConnectorPlugin<SFXGenerateParams, AssetResult>;
export type ImagePlugin = ConnectorPlugin<ImageGenerateParams, AssetResult>;
export type TTSPlugin = ConnectorPlugin<TTSGenerateParams, TTSResult>;
export type VideoPlugin = ConnectorPlugin<VideoGenerateParams, AssetResult>;

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
