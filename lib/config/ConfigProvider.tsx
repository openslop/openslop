"use client";

import { createContext, use, useMemo, useState, type ReactNode } from "react";
import type {
  ConnectorConfig,
  ConnectorType,
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

export type Mode = "prompt" | "inputScript";

export type ConnectorRegistry = Record<ConnectorType, ConnectorConfig>;

export type ProviderConfig = { models: string[] };

export type ConfiguredConnectors = Record<
  ConnectorType,
  Record<ProviderKey, ProviderConfig>
>;

const defaultConnectorDefaults: ConnectorRegistry = {
  llm: {
    provider: "openslop",
    model: "Slop LLM v1",
    apiKey: "",
    plugins: [osmlPlugin],
  },
  tts: { provider: "openslop", model: "Slop TTS v1", apiKey: "" },
  image: { provider: "openslop", model: "Slop Image v1", apiKey: "" },
  video: { provider: "openslop", model: "Slop Video v1", apiKey: "" },
  sfx: { provider: "openslop", model: "Slop SFX v1", apiKey: "" },
  music: { provider: "openslop", model: "Slop Music v1", apiKey: "" },
};

const defaultConfiguredConnectors: ConfiguredConnectors = {
  llm: { openslop: { models: Object.keys(LLM_MODELS) } },
  image: { openslop: { models: Object.keys(IMAGE_MODELS) } },
  tts: { openslop: { models: Object.keys(TTS_MODELS) } },
  video: { openslop: { models: Object.keys(VIDEO_MODELS) } },
  sfx: { openslop: { models: Object.keys(SFX_MODELS) } },
  music: { openslop: { models: Object.keys(MUSIC_MODELS) } },
};

type ConfigContextValue = {
  connectorDefaults: ConnectorRegistry;
  configuredConnectors: ConfiguredConnectors;
  mode: Mode;
  setConnectorDefaults: React.Dispatch<React.SetStateAction<ConnectorRegistry>>;
  setConfiguredConnectors: React.Dispatch<
    React.SetStateAction<ConfiguredConnectors>
  >;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
};

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function useConfig() {
  const ctx = use(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
  return ctx;
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [connectorDefaults, setConnectorDefaults] = useState<ConnectorRegistry>(
    defaultConnectorDefaults,
  );
  const [configuredConnectors, setConfiguredConnectors] =
    useState<ConfiguredConnectors>(defaultConfiguredConnectors);
  const [mode, setMode] = useState<Mode>("prompt");

  const connectorsWithModePlugins = useMemo<ConnectorRegistry>(
    () => ({
      ...connectorDefaults,
      llm: {
        ...connectorDefaults.llm,
        plugins: [
          ...(connectorDefaults.llm.plugins ?? []),
          mode === "prompt" ? storyModePlugin : scriptModePlugin,
        ],
      },
    }),
    [connectorDefaults, mode],
  );

  const value = useMemo<ConfigContextValue>(
    () => ({
      connectorDefaults: connectorsWithModePlugins,
      configuredConnectors,
      mode,
      setConnectorDefaults,
      setConfiguredConnectors,
      setMode,
    }),
    [connectorsWithModePlugins, configuredConnectors, mode],
  );

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}
