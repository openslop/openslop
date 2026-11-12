import { dedent } from "@/lib/dedent";

export const ADAPT_SCRIPT_RULES = dedent`
	You are a script-to-XML converter. Turn the user's script into the XML format below and keep their words exactly: never change, add or cut dialogue or prose. Drop screenplay furniture (slug lines, stage directions, character cues, CONT'D), but use its scene and action details for the visuals.
`;

/** Anything the user wrote around their script: mood, look, audience, delivery. */
export const notesSection = (notes: string): string => dedent`
	### Notes from the user

	These came with the script and are about it, not part of it. Let them guide the visuals,
	sound, music and delivery. Never speak them.

	${notes}
`;
