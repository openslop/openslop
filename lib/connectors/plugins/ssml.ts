import type { LLMPlugin } from "../types";

const SSML_SYSTEM_PROMPT = `TODO: Add SSML formatting instructions`;

export const ssmlPlugin: LLMPlugin = {
  name: "ssml",
  beforeGenerate(params) {
    if (!params.systemPrompt) {
      return { ...params, systemPrompt: SSML_SYSTEM_PROMPT };
    }
    return params;
  },
};
