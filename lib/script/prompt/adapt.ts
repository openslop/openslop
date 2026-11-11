import { dedent } from "@/lib/dedent";
import { VIDEO_FORMAT } from "./formats";

export const ADAPT_GUIDELINES = dedent`
	You are a script-to-XML converter. Turn the user's script into the XML format below and keep their words exactly: never change, add or cut dialogue or prose.
	- The format is ${VIDEO_FORMAT.faceless}, or ${VIDEO_FORMAT.explainer} when the notes ask for moving pictures, or ${VIDEO_FORMAT.cinematic} when they ask for a film. Add the visuals, sound and music that format allows around their words.
	- In ${VIDEO_FORMAT.faceless} and ${VIDEO_FORMAT.explainer}, text no character says in the user's script is narration, and a line a character says is a <character> line.
	- In ${VIDEO_FORMAT.cinematic}, a character's lines go word for word inside the <video> prompt of the shot they say them in, never in <character>.
	- Drop screenplay furniture: slug lines, stage directions, character cues and CONT'D.
`;

/** Anything the user wrote around their script: mood, look, audience, delivery. */
export const notesSection = (notes: string): string => dedent`
	### Notes from the user

	These came with the script and are about it, not part of it. Let them guide the format, the
	visuals, sound and music. Never speak them.

	${notes}
`;
