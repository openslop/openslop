export type ConnectorType = "llm" | "music" | "sfx" | "image" | "tts" | "video";

export type ProviderKey = "openslop";

export type AudioFormat = "mp3" | "wav" | "ogg" | "flac";
export type ImageFormat = "png" | "jpeg" | "webp";
export type VideoFormat = "mp4" | "webm";

export type ModelInfo = {
  id: string;
  name: string;
  description?: string;
};

export interface ConnectorPlugin<TParams = unknown, TResult = unknown> {
  name: string;
  beforeGenerate?(params: TParams): TParams | Promise<TParams>;
  afterGenerate?(result: TResult): TResult | Promise<TResult>;
  transformPrompt?(prompt: string): string | Promise<string>;
  onError?(error: Error): void | Promise<void>;
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

// Audio types (shared by Music, SFX, TTS)

export type AudioResult = {
  data: ArrayBuffer;
  format: AudioFormat;
  durationSeconds: number;
};

export type MusicGenerateParams = {
  prompt: string;
  model?: string;
  format?: AudioFormat;
  durationSeconds?: number;
};

export type SFXGenerateParams = {
  prompt: string;
  model?: string;
  format?: AudioFormat;
  durationSeconds?: number;
};

export interface MusicConnector extends Connector {
  readonly type: "music";
  generate(params: MusicGenerateParams): Promise<AudioResult>;
}

export interface SFXConnector extends Connector {
  readonly type: "sfx";
  generate(params: SFXGenerateParams): Promise<AudioResult>;
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
  type: "base64" | "url";
};

export interface ImageConnector extends Connector {
  readonly type: "image";
  generate(params: ImageGenerateParams): Promise<ImageResult>;
}

// TTS types

export type TTSGenerateParams = {
  prompt: string;
  voiceId: string;
  model?: string;
  speed?: number;
  volume?: number;
  format?: AudioFormat;
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
  generate(params: TTSGenerateParams): Promise<AudioResult>;
  searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]>;
}

// Video types

export type VideoGenerateParams = {
  prompt: string;
  model?: string;
  referenceImageUrl?: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
  format?: VideoFormat;
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
export type MusicPlugin = ConnectorPlugin<MusicGenerateParams, AudioResult>;
export type SFXPlugin = ConnectorPlugin<SFXGenerateParams, AudioResult>;
export type ImagePlugin = ConnectorPlugin<ImageGenerateParams, ImageResult>;
export type TTSPlugin = ConnectorPlugin<TTSGenerateParams, AudioResult>;
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
