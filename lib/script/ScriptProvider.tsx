"use client";

import {
  createContext,
  use,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Descendant } from "slate";
import { useConfig } from "@/lib/config/ConfigProvider";
import { createConnector } from "@/lib/connectors/factory";
import { useOSMLSerializer } from "@/app/components/canvas/hooks/useOSMLSerializer";

type ScriptContextValue = {
  script: string;
  nodes: Descendant[];
  loading: boolean;
  submitPrompt: (prompt: string) => Promise<void>;
  stopGeneration: () => void;
};

const ScriptContext = createContext<ScriptContextValue | null>(null);

export function useScript() {
  const ctx = use(ScriptContext);
  if (!ctx) throw new Error("useScript must be used within ScriptProvider");
  return ctx;
}

export function ScriptProvider({ children }: { children: ReactNode }) {
  const { connectors } = useConfig();
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const { nodes, appendChunk } = useOSMLSerializer();

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
        const connector = createConnector("llm", connectors.llm);
        for await (const chunk of connector.stream({ prompt })) {
          if (controller.signal.aborted) break;
          setScript((prev) => prev + chunk.text);
          appendChunk(chunk.text);
        }
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setLoading(false);
        }
      }
    },
    [connectors.llm, appendChunk],
  );

  return (
    <ScriptContext.Provider
      value={{
        script,
        nodes,
        loading,
        submitPrompt,
        stopGeneration,
      }}
    >
      {children}
    </ScriptContext.Provider>
  );
}
