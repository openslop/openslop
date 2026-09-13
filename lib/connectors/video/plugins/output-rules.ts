import type { ConnectorPlugin } from "@/lib/connectors/types";

/** Music is its own element, and captions are drawn by the player. */
export const VIDEO_OUTPUT_RULES =
	"No subtitles, no watermarks, no logos, no music.";

/** Ends every video prompt with the output rules, so no prompt writer has to remember them. */
export function createVideoOutputRulesPlugin(): ConnectorPlugin {
	return {
		name: "video-output-rules",
		transformPrompt: (prompt) => `${prompt.trimEnd()} ${VIDEO_OUTPUT_RULES}`,
	};
}
