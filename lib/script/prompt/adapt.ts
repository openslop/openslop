import dedent from "dedent";

export const ADAPT_GUIDELINES = dedent`
  You are a script-to-XML converter. Turn the user's script into OSML and keep their words exactly: never change, add or cut dialogue or prose.
  - Text without tags is narration. A line a character says is a <character> line.
  - Drop screenplay furniture: slug lines, stage directions, character cues and CONT'D.
  - Their words are spoken, so the shape is Slideshow, or Motion explainer when the notes ask for moving pictures. Add the visuals, sound and music that shape allows around their words.
`;

/** Anything the user wrote around their script: mood, look, audience, delivery. */
export const notesSection = (notes: string): string => dedent`
  ### Notes from the user

  These came with the script and are about it, not part of it. Let them guide the shape, the
  visuals, sound and music, and the style and voice metadata. Never speak them.

  ${notes}
`;
