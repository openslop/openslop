"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { createConnector } from "@/lib/connectors/factory";
import { createClient } from "@/lib/supabase/client";

type ScriptContextValue = {
  script: string;
  loading: boolean;
  submitPrompt: (prompt: string) => Promise<void>;
  refineScript: (prompt: string) => Promise<void>;
  stopGeneration: () => void;
};

const ScriptContext = createContext<ScriptContextValue | null>(null);

export function useScript() {
  const ctx = useContext(ScriptContext);
  if (!ctx) throw new Error("useScript must be used within ScriptProvider");
  return ctx;
}

export function ScriptProvider({ children }: { children: ReactNode }) {
  const { config } = useConfig();
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }, []);

  const submitPrompt = useCallback(
    async (prompt: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setScript("");
      setLoading(true);
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const llmConfig = {
          ...config.llm,
          apiKey: session?.access_token ?? config.llm.apiKey,
        };
        const connector = createConnector("llm", llmConfig);
        for await (const chunk of connector.stream({ prompt })) {
          if (controller.signal.aborted) break;
          setScript((prev) => prev + chunk.text);
        }
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setLoading(false);
        }
      }
    },
    [config.llm],
  );

  const refineScript = useCallback(async (_prompt: string) => {}, []);

  return (
    <ScriptContext.Provider
      value={{ script, loading, submitPrompt, refineScript, stopGeneration }}
    >
      {children}
    </ScriptContext.Provider>
  );
}
