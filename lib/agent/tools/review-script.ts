import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { scriptRules } from "@/lib/script/prompt/build";
import { VIDEO_FORMAT_NAMES } from "@/lib/script/prompt/formats";
import { NO_FINDINGS, reviewPrompt } from "@/lib/script/prompt/review";
import { Search } from "@/components/ui/icon";
import { defineTool } from "./define-tool";

export const reviewScript = defineTool({
	description: dedent`
	  Have the script on the canvas read back against every rule it was written to: the XML
	  format, the format's element list, the video prompt format, continuity, dialogue,
	  pacing and style.

	  Findings come back one bullet each, naming the element's id, the rule it breaks and the
	  smallest change that fixes it. Fix them with edit_script, read the script, then review
	  again. Stop when it replies ${NO_FINDINGS}, or when three reviews have run.

	  Skip a finding if fixing it would undo something the user asked for or changed themselves,
	  and tell them which one you skipped and why.

	  Run it when the user explicitly asks for a review or accepts your offer. Do not run it
	  just because you wrote, adapted or edited the script.
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
		if (ctx.isScriptEmpty())
			return "The script is empty, so there is nothing to review.";
		return ctx.generateText(reviewPrompt(ctx.readScript(), format), {
			systemPrompt: scriptRules(
				ctx.readAssets(),
				ctx.readProject().scriptSettings,
			),
		});
	},
	snapshot: true,
	draftsScript: true,
});
