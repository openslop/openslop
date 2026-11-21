import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { MagicCaptions } from "@/components/ui/icon";
import { requireMedia } from "@/lib/project/media";
import { defineTool } from "./define-tool";

export const captionMedia = defineTool({
	description: dedent`
	  Transcribe video and audio files from read_media into timed words, saved on each file so
	  it is only done once. Read the words with view_media.
	`,
	input: z.object({
		urls: z
			.array(z.url())
			.min(1)
			.describe("The files' URLs, exactly as read_media gives them."),
	}),
	output: z.string(),
	icon: MagicCaptions,
	label: "Captioning media",
	execute: async ({ urls }, ctx) => {
		const media = ctx.readProject().media;
		await Promise.all(
			urls.map((url) => ctx.captionMedia(requireMedia(media, url))),
		);
		return "Captioned. Read the words with view_media.";
	},
});
