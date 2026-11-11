import { dedent } from "@/lib/dedent";

export const ADAPT_SCRIPT_RULES = dedent`
	You are a script-to-XML converter. Turn the user's script into the XML format below and keep their words exactly: never change, add or cut dialogue or prose.
	- Honor the project's format. If no format is set, pick the closest one from the script and notes.
	- Follow the Format rules below to decide where the user's words belong. Keep them word for word, even when the speech-writing style rules below would suggest rewriting them.
	- Drop screenplay furniture: slug lines, stage directions, character cues and CONT'D. Use their scene and action details to guide the visuals.
	- Add the visuals, sound and music the format allows around their words.
`;

/** Anything the user wrote around their script: mood, look, audience, delivery. */
export const notesSection = (notes: string): string => dedent`
	### Notes from the user

	These came with the script and are about it, not part of it. Let them guide the visuals,
	sound, music and delivery, and the format when none is set. Never speak them.

	${notes}
`;
