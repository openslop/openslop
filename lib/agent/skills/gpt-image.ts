import { dedent } from "@/lib/dedent";
import type { Skill } from "./registry";

// Based on https://developers.openai.com/api/docs/guides/image-prompting?model=gpt-image-2.6
export const gptImage = {
	name: "gpt-image",
	description:
		"Quirks of the GPT Image model (2.6 Sunburst). Load it before writing <image> prompts for it.",
	content: dedent`
		- GPT Image adds text and numbers of its own, so whenever the image shows any text, add "no other text".
		- Spell unusual words and brand names out letter by letter, like "Zyqo (Z-Y-Q-O)".
	`,
} as const satisfies Skill;
