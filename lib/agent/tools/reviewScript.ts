import dedent from "dedent";
import { z } from "zod";
import { scriptRules } from "@/lib/script/prompt/build";
import { VIDEO_FORMAT_NAMES } from "@/lib/script/prompt/formats";
import { NO_FINDINGS, reviewPrompt } from "@/lib/script/prompt/review";
import { Search } from "@/components/ui/icon";
import { defineTool } from "./defineTool";

export const reviewScript = defineTool({
	description: dedent`
	  Have the script on the canvas read back against every rule it was written to: OSML, the
	  format's element list, the video prompt format, continuity, dialogue, pacing and style.
	  A reader with no stake in the draft catches what rereading your own work does not.

	  Findings come back one bullet each, naming the element's id, the rule it breaks and the
	  smallest change that fixes it. Fix them with edit_script, read the script, then review
	  again. Stop when it replies ${NO_FINDINGS}, or when three reviews have run: a fourth
	  never pays for itself.

	  Leave a finding alone when acting on it would undo what the user asked for, and say
	  which one you left and why.

	  Run it after write_script and adapt_script, and after an edit that rewrote several
	  elements. A one-element tweak does not need it.
	`,
	input: z.object({
		format: z
			.enum(VIDEO_FORMAT_NAMES)
			.optional()
			.describe(
				"The format the script was written to, so the review holds it to that element list.",
			),
	}),
	output: z.string(),
	icon: Search,
	label: "Reviewing the script",
	execute: async ({ format }, ctx) => {
		const script = ctx.readScript().trim();
		if (!script) return "The canvas is empty, so there is nothing to review.";
		// No ceiling of its own: thinking and the reply share one budget, and a
		// review that runs out of it comes back empty.
		return ctx.generateText(reviewPrompt(script, format), {
			systemPrompt: scriptRules(ctx.readMetadata()),
		});
	},
	snapshot: true,
});
