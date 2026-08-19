import {
	NARRATION_WORDS_PER_MINUTE,
	VIDEO_LENGTH_SPECS,
} from "@/lib/video/videoLength";
import type { AgentToolContext } from "./context";

const minutes = (words: number) =>
	(words / NARRATION_WORDS_PER_MINUTE).toFixed(1);

export async function countWords(ctx: AgentToolContext): Promise<string> {
	const words = ctx.countSpokenWords();
	const { length } = ctx.readMetadata().videoSettings;
	const { minWords, maxWords } = VIDEO_LENGTH_SPECS[length];

	const verdict =
		words < minWords
			? `under by ${minWords - words} words`
			: words > maxWords
				? `over by ${words - maxWords} words`
				: "within the target range";

	return `${words} spoken words, about ${minutes(words)} minutes of speech. Target: ${length} (${minWords} to ${maxWords} words) - ${verdict}.`;
}
