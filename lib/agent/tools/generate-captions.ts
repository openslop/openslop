import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { MagicCaptions } from "@/components/ui/icon";
import { defineTool } from "./define-tool";

export const generateCaptions = defineTool({
	description: dedent`
	  Queue speech to text on clips. No ids: every uncaptioned clip that has a result. Ids:
	  those clips, redoing existing captions unless hand-edited. The output lists skipped clips
	  and why. Captions show only while the captions setting is on (update_video_settings).
	`,
	input: z.object({
		ids: z
			.array(z.string().min(1))
			.min(1)
			.optional()
			.describe("Element ids from read_script."),
	}),
	output: z.string(),
	icon: MagicCaptions,
	label: ({ ids }) =>
		ids?.length ? `Captioning ${ids.join(", ")}` : "Captioning the timeline",
	execute: async ({ ids }, ctx) => {
		const { queued, skipped } = ctx.generateCaptions(ids);
		return [
			queued.length
				? `Captioning ${queued.join(", ")}.`
				: "Nothing to caption.",
			...skipped.map(({ id, reason }) => `Skipped ${id}: it ${reason}.`),
		].join("\n");
	},
});
