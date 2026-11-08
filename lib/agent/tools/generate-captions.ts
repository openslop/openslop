import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { MagicCaptions } from "@/components/ui/icon";
import { defineTool } from "./define-tool";

export const generateCaptions = defineTool({
	description: dedent`
	  Caption clips: speech to text runs on what each clip holds now, with the project's Speech
	  to Text model, and every word lands on the clip with when it is said. With no ids it
	  captions every clip on the timeline that would show captions and has no words yet, the
	  same clips as Auto captions in the Captions panel. Name ids to caption those clips, which
	  also redoes captions a clip already has. It only queues the work: the words arrive in
	  the background. A clip needs a result first, so the output names every clip it skipped
	  and why; tell the user what to generate. Captions show in the video only while the
	  captions setting is on (update_video_settings).
	`,
	input: z.object({
		ids: z
			.array(z.string().min(1))
			.min(1)
			.optional()
			.describe(
				"Element ids, exactly as read_script gives them. Leave out to caption every uncaptioned clip.",
			),
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
