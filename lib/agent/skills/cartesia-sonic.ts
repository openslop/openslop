import { dedent } from "@/lib/dedent";
import type { Skill } from "./registry";

// Based on https://docs.cartesia.ai/build-with-cartesia/sonic-3/prompting-tips and https://docs.cartesia.ai/build-with-cartesia/sonic-3/ssml-tags
export const cartesiaSonic = {
	name: "cartesia-sonic",
	description:
		"Quirks of the Sonic voice models. Load it before writing <speech> lines for a Sonic model.",
	content: dedent`
		- End every line with . ? or !. A lone word or fragment reads flat, so make it a sentence.
		- To spell a code letter by letter, separate the characters with spaces and the groups with commas: "Your code is A B C, 1 2 3."
		- The emotion only comes through when the words carry the same feeling. Sonic is most reliable with neutral, calm, angry, content, sad and scared.
		- Never write Sonic's own tags like <emotion>, <speed>, <break> or <spell>: they break the script. Use the emotion and speed attributes and punctuation.
	`,
} as const satisfies Skill;
