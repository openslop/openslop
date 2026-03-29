"use client";

import { createContext, use, useMemo, useState, type ReactNode } from "react";
import set from "lodash/fp/set";
import type {
  ConnectorConfig,
  ConnectorType,
  LLMPlugin,
  ProviderKey,
} from "@/lib/connectors/types";
import { LLM_MODELS } from "@/lib/connectors/llm/openslop/models";
import { IMAGE_MODELS } from "@/lib/connectors/image/openslop/models";
import { TTS_MODELS } from "@/lib/connectors/tts/openslop/models";
import { VIDEO_MODELS } from "@/lib/connectors/video/openslop/models";
import { SFX_MODELS } from "@/lib/connectors/sfx/openslop/models";
import { MUSIC_MODELS } from "@/lib/connectors/music/openslop/models";
import { scriptModePlugin } from "../connectors/plugins/script-mode";
import { osmlPlugin } from "../connectors/plugins/osml";
import { storyModePlugin } from "../connectors/plugins/story-mode";
import { getDefaultConnector } from "./connectorUtils";

export type ComposerMode = "story" | "script";

const MODE_PLUGINS: Record<ComposerMode, LLMPlugin> = {
  story: storyModePlugin,
  script: scriptModePlugin,
};

export type ConnectorRegistry = Record<
  ConnectorType,
  Record<ProviderKey, ConnectorConfig>
>;

const initialConnectorConfig: ConnectorRegistry = {
  llm: {
    openslop: {
      defaultModel: "Slop LLM v1",
      models: Object.keys(LLM_MODELS),
      isDefault: true,
      apiKey: "",
      plugins: [osmlPlugin],
    },
  },
  tts: {
    openslop: {
      defaultModel: "Slop TTS v1",
      models: Object.keys(TTS_MODELS),
      isDefault: true,
      apiKey: "",
    },
  },
  image: {
    openslop: {
      defaultModel: "Slop Image v1",
      models: Object.keys(IMAGE_MODELS),
      isDefault: true,
      apiKey: "",
    },
  },
  video: {
    openslop: {
      defaultModel: "Slop Video v1",
      models: Object.keys(VIDEO_MODELS),
      isDefault: true,
      apiKey: "",
    },
  },
  sfx: {
    openslop: {
      defaultModel: "Slop SFX v1",
      models: Object.keys(SFX_MODELS),
      isDefault: true,
      apiKey: "",
    },
  },
  music: {
    openslop: {
      defaultModel: "Slop Music v1",
      models: Object.keys(MUSIC_MODELS),
      isDefault: true,
      apiKey: "",
    },
  },
};

type ConfigContextValue = {
  connectorConfig: ConnectorRegistry;
  composerMode: ComposerMode;
  setConnectorConfig: React.Dispatch<React.SetStateAction<ConnectorRegistry>>;
  setComposerMode: React.Dispatch<React.SetStateAction<ComposerMode>>;
};

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function useConfig() {
  const ctx = use(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
  return ctx;
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [connectorConfig, setConnectorConfig] = useState<ConnectorRegistry>(
    initialConnectorConfig,
  );
  const [composerMode, setComposerMode] = useState<ComposerMode>("story");

  const configWithModePlugins = useMemo<ConnectorRegistry>(() => {
    const { provider, config: llmConfig } = getDefaultConnector(
      connectorConfig,
      "llm",
    );
    return set(
      ["llm", provider, "plugins"],
      [...(llmConfig.plugins ?? []), MODE_PLUGINS[composerMode]],
      connectorConfig,
    );
  }, [connectorConfig, composerMode]);

  const value = useMemo<ConfigContextValue>(
    () => ({
      connectorConfig: configWithModePlugins,
      composerMode,
      setConnectorConfig,
      setComposerMode,
    }),
    [configWithModePlugins, composerMode],
  );

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}
