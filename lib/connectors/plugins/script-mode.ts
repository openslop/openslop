import dedent from "dedent";
import type { LLMPlugin } from "../types";

const SCRIPT_MODE_SYSTEM_PROMPT = dedent`
  You are a script-to-XML converter.
  The user will provide some text, and you will return that text with
  annotations according to the XML format described below. Do NOT modify the script
  itself, simply conform the text to the XML format described below.

  ### Miscellaneous Rules
  - Omit non-narrative text from the final output like stage directions (e.g. CONT'd), character names, etc.
  - Convert any words in ALL CAPS to regular case.
  - Never say the word "NARRATOR" in the text.
  - Never add dialogue or narrative text to the story that is not in the original script.
`;

export const scriptModePlugin: LLMPlugin = {
  name: "scriptMode",
  beforeGenerate(params) {
    return {
      ...params,
      systemPrompt: params.systemPrompt
        ? `${SCRIPT_MODE_SYSTEM_PROMPT}\n\n${params.systemPrompt}`
        : SCRIPT_MODE_SYSTEM_PROMPT,
    };
  },
};
