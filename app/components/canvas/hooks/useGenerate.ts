import { useCallback, useEffect, useRef, useState } from "react";
import pick from "lodash/pick";
import { Node } from "slate";
import { createConnector } from "@/lib/connectors/factory";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import type {
  ConnectorType,
  ImageResult,
  ProviderKey,
  TTSResult,
  VideoJob,
} from "@/lib/connectors/types";
import type { CanvasElement, GenerationResult } from "../types";
import { ZERO_WIDTH_SPACE } from "../config/constants";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";

const audioFromBuffer = (buf: ArrayBuffer): GenerationResult => ({
  kind: "audio",
  src: URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" })),
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
  config: { defaultModel: string; models: string[]; isDefault: boolean },
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

function isObjectUrl(src: string) {
  return src.startsWith("blob:");
}

export function useGenerate(element: CanvasElement) {
  const { connectorConfig } = useConfig();
  const [generating, setGenerating] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<GenerationResult | null>(null);

  useEffect(() => {
    if (!generating) return;
    const start = Date.now();
    const id = setInterval(
      () => setSeconds(((Date.now() - start) / 1000) | 0),
      1000,
    );
    return () => clearInterval(id);
  }, [generating]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (resultRef.current && isObjectUrl(resultRef.current.src)) {
        URL.revokeObjectURL(resultRef.current.src);
      }
    };
  }, []);

  const generate = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const elementConfig = ELEMENT_CONFIGS[element.type];
    const connectorType = elementConfig.connector;
    const attrs = element.customAttributes ?? {};
    const provider = (attrs.provider as ProviderKey) ?? "openslop";
    const { config: baseConfig } = getDefaultConnector(
      connectorConfig,
      connectorType,
    );
    const config = {
      ...baseConfig,
      ...(attrs.model && { defaultModel: attrs.model }),
    };

    const prompt = Node.string(element).replace(ZERO_WIDTH_SPACE, "").trim();
    if (!prompt) {
      setError("Enter a prompt first");
      return;
    }

    const extraParams = pick(attrs, elementConfig.generateParams ?? []);

    setGenerating(true);
    setSeconds(0);
    setError(null);

    generateForElement(connectorType, provider, config, prompt, extraParams)
      .then((res) => {
        if (controller.signal.aborted) return;
        if (resultRef.current && isObjectUrl(resultRef.current.src)) {
          URL.revokeObjectURL(resultRef.current.src);
        }
        resultRef.current = res;
        setResult(res);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setGenerating(false);
        }
      });
  }, [element, connectorConfig]);

  const discard = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (resultRef.current && isObjectUrl(resultRef.current.src)) {
      URL.revokeObjectURL(resultRef.current.src);
    }
    resultRef.current = null;
    setGenerating(false);
    setSeconds(0);
    setResult(null);
    setError(null);
  }, []);

  return { generating, seconds, result, error, generate, discard };
}
