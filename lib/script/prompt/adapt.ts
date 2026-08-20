import dedent from "dedent";

export const ADAPT_GUIDELINES = dedent`
  You are a script-to-XML converter.
  The user will provide some text, and you will return that text with
  annotations according to the XML format described below. Do NOT modify the script
  itself, simply conform the text to the XML format described below. If the script doesn't contain
  any explicit narration/image/character/music/sound annotations, assume the text is all narration
  and fill in the blanks with the appropriate non-narration XML tags to make this an engaging script for a video.

  ### Miscellaneous Rules
  - Omit non-narrative text from the final output like stage directions (e.g. CONT'd), character names, etc.
  - Never add dialogue or narrative text to the story that is not in the original script.
`;

/** Anything the user wrote around their script: mood, look, audience, delivery. */
export const notesSection = (notes: string): string => dedent`
  ### Notes from the user

  These came alongside the script and are about it, not part of it. Let them inform what
  you add around the script: the images, sound and music, and the style and voice
  metadata. Never speak them, and never fold them into narration or dialogue.

  ${notes}
`;
