"use client";

import { createContext, use, useMemo, useState, type ReactNode } from "react";
import type { ConnectorConfig, ConnectorType } from "@/lib/connectors/types";
import { scriptModePlugin } from "../connectors/plugins/script-mode";
import { osmlPlugin } from "../connectors/plugins/osml";
import { storyModePlugin } from "../connectors/plugins/story-mode";

export type Mode = "prompt" | "inputScript";

export type ConnectorRegistry = Record<ConnectorType, ConnectorConfig>;

const defaultConnectors: ConnectorRegistry = {
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

type ConfigContextValue = {
  connectors: ConnectorRegistry;
  setConnectors: React.Dispatch<React.SetStateAction<ConnectorRegistry>>;
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
};

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function useConfig() {
  const ctx = use(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
  return ctx;
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [connectors, setConnectors] =
    useState<ConnectorRegistry>(defaultConnectors);
  const [mode, setMode] = useState<Mode>("prompt");

  const connectorsWithModePlugins = useMemo<ConnectorRegistry>(
    () => ({
      ...connectors,
      llm: {
        ...connectors.llm,
        plugins: [
          ...(connectors.llm.plugins ?? []),
          mode === "prompt" ? storyModePlugin : scriptModePlugin,
        ],
      },
    }),
    [connectors, mode],
  );

  return (
    <ConfigContext.Provider
      value={{
        connectors: connectorsWithModePlugins,
        setConnectors,
        mode,
        setMode,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}
