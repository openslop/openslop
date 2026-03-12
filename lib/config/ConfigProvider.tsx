"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ConnectorConfig } from "@/lib/connectors/types";

export type AppConfig = {
  llm: ConnectorConfig;
};

const defaultConfig: AppConfig = {
  llm: { provider: "openslop", apiKey: "" },
};

type ConfigContextValue = {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
};

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
  return ctx;
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);

  return (
    <ConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}
