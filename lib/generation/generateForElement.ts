import { createConnector } from "@/lib/connectors/factory";
import type {
  ConnectorConfig,
  ConnectorType,
  ImageResult,
  ProviderKey,
  TTSResult,
  VideoJob,
} from "@/lib/connectors/types";
import type { GenerationResult } from "@/app/components/canvas/types";

const audioFromBuffer = (buf: ArrayBuffer): GenerationResult => ({
  kind: "audio",
  src: URL.createObjectURL(new Blob([buf])),
});

const RESULT_CONVERTERS: Record<
  ConnectorType,
  (raw: never) => GenerationResult
> = {
  image: (r: ImageResult) => ({
    kind: "image",
    src: `data:image/${r.format};base64,${r.data}`,
  }),
  video: (r: VideoJob) => {
    if (r.status === "failed")
      throw new Error(r.error ?? "Video generation failed");
    return { kind: "video", src: r.resultUrl! };
  },
  tts: (r: TTSResult) => ({
    kind: "audio",
    src: `data:audio/mp3;base64,${r.data}`,
  }),
  music: audioFromBuffer as (raw: never) => GenerationResult,
  sfx: audioFromBuffer as (raw: never) => GenerationResult,
  llm: () => {
    throw new Error("LLM generation not supported");
  },
};

export async function generateForElement(
  connectorType: ConnectorType,
  provider: ProviderKey,
  config: ConnectorConfig,
  prompt: string,
  extraParams: Record<string, unknown>,
): Promise<GenerationResult> {
  const connector = createConnector(connectorType, provider, config);
  const raw = await connector.generate({
    prompt,
    model: config.defaultModel,
    ...extraParams,
  });
  return RESULT_CONVERTERS[connectorType](raw as never);
}
