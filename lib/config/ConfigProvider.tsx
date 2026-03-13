"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ConnectorConfig } from "@/lib/connectors/types";
import { scriptModePlugin } from "../connectors/plugins/script-mode";
import { ssmlPlugin } from "../connectors/plugins/ssml";
import { storyModePlugin } from "../connectors/plugins/story-mode";

export type Mode = "prompt" | "inputScript";

export type AppConfig = {
  llm: ConnectorConfig;
};

const defaultConfig: AppConfig = {
  llm: {
    provider: "openslop",
    apiKey: "",
    plugins: [ssmlPlugin],
  },
};

type ConfigContextValue = {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
};

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
  return ctx;
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [mode, setMode] = useState<Mode>("prompt");

  const configWithModePlugins = useMemo<AppConfig>(
    () => ({
      ...config,
      llm: {
        ...config.llm,
        plugins: [
          ...(config.llm.plugins ?? []),
          mode === "prompt" ? storyModePlugin : scriptModePlugin,
        ],
      },
    }),
    [config, mode],
  );

  return (
    <ConfigContext.Provider
      value={{ config: configWithModePlugins, setConfig, mode, setMode }}
    >
      {children}
    </ConfigContext.Provider>
  );
}
