import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { Sparkles } from "@/components/ui/icon";
import { defineTool } from "./define-tool";

export const readGeneration = defineTool({
	description: dedent`
	  Read where each generated element stands: ungenerated, queued, generating, generated,
	  stale (and why), failed (and the error), or uploaded. It changes as the user generates,
	  so don't rely on an earlier read.
	`,
	input: z.object({}),
	output: z.string(),
	icon: Sparkles,
	label: "Reading generations",
	execute: async (_input, ctx) => {
		const states = ctx.elementStates();
		if (states.length === 0) return "No element on the canvas generates media.";
		return states
			.map(
				({ id, state, detail }) =>
					`- ${id}: ${state}${detail ? ` (${detail})` : ""}`,
			)
			.join("\n");
	},
	retention: "turn",
});
