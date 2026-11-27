import { dedent } from "@/lib/dedent";
import type { Skill } from "./registry";

// Based on https://docs.cartesia.ai/build-with-cartesia/sonic-3/prompting-tips, https://docs.cartesia.ai/build-with-cartesia/sonic-3/ssml-tags and https://docs.cartesia.ai/build-with-cartesia/sonic-3/volume-speed-emotion
export const cartesiaSonic = {
	name: "cartesia-sonic",
	description:
		"How Cartesia Sonic voices read <speech> lines: punctuation, numbers, codes, hesitations, emotion and speed.",
	content: dedent`
		Sonic speaks a <speech> line exactly as written: it never adds words or sounds of its own. On top of the <speech> rules in osml:

		- Write full sentences with normal punctuation and capitals, and end every line with . ? or !. A lone word or fragment reads flat, so give it a sentence: "Your code is A B C, 1 2 3." not "A B C, 1 2 3".
		- Write numbers, money, dates, times, phone numbers and emails the usual way, and Sonic reads them out: 1,234,567, $19.99, 04/20/2025, 7:00 PM, (415) 555-1212, user@example.com. Spell one out in words only if it comes out wrong.
		- To spell a code or a word letter by letter, separate the characters with spaces and the groups with a comma: "A B C, 1 2 3". Never put full stops between letters.
		- For hesitation, write uh, um or hmm, spelled normally and set off by commas, and only where the character really hesitates: "It's, uh, four hundred dollars." Never stretch them, like "ummm" or "sooo".
		- No markdown, asterisks, hashtags, emoji or symbols: Sonic reads them aloud.

		Emotion and speed:
		- The emotion attribute only works when the words carry the same feeling. "I'm so excited!" with emotion="sad" comes out wrong, so write the line to match its emotion. Sonic is most reliable with neutral, calm, angry, content, sad and scared.
		- One emotion per line. When a character's mood changes, start a new <speech>.
		- Well-punctuated lines pace themselves, so leave speed at medium unless the moment needs it slower or faster.

		Sonic has its own tags for emotion, speed, volume, pauses and spelling. They look like script tags and would break the script, so never write them. Use the emotion and speed attributes and punctuation instead.
	`,
} as const satisfies Skill;
