"use client";

import { useState } from "react";
import { useScript } from "@/lib/script/ScriptProvider";
import PrePromptView from "./PrePromptView";
import PostPromptView from "./PostPromptView";

export default function Editor() {
  const { script, loading, submitPrompt } = useScript();
  const [prompted, setPrompted] = useState(false);

  const hasScript = script.length > 0 || loading;

  const handleSubmit = (value: string) => {
    setPrompted(true);
    submitPrompt(value);
  };

  return (
    <div
      className={`flex min-h-screen flex-col items-center text-white transition-[padding] duration-700 ease-out ${
        hasScript ? "" : "pt-[30vh]"
      }`}
    >
      {prompted ? (
        <PostPromptView />
      ) : (
        <PrePromptView onSubmit={handleSubmit} />
      )}
    </div>
  );
}
