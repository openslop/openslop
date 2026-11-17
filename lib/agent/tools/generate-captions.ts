import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { MagicCaptions } from "@/components/ui/icon";
import { errorMessage } from "@/lib/errors";
import { defineTool } from "./define-tool";

function toolLabel(ids?: string[], mediaUrls?: string[]) {
	if (mediaUrls?.length) {
		const fileLabel = mediaUrls.length === 1 ? "file" : "files";
		return `Captioning ${mediaUrls.length} media ${fileLabel}`;
	}
	if (ids?.length) return `Captioning ${ids.join(", ")}`;
	return "Captioning the timeline";
}

export const generateCaptions = defineTool({
	description: dedent`
	  Caption elements or files in the media library. Omit ids and media_urls to queue captions
	  for every generated, uncaptioned element except music. Provide ids to caption those
	  elements, music included. Provide media_urls from read_media to transcribe library files;
	  their timed words are saved once per file. Then use view_media to read the word timings.
	  The output lists skipped elements with reasons. Element captions show while the captions
	  setting is on (update_video_settings).
	`,
	input: z.object({
		ids: z
			.array(z.string().min(1))
			.min(1)
			.optional()
			.describe("Element ids from read_script."),
		media_urls: z
			.array(z.url())
			.min(1)
			.optional()
			.describe("Media URLs exactly as read_media gives them."),
	}),
	output: z.string(),
	icon: MagicCaptions,
	label: ({ ids, media_urls }) => toolLabel(ids, media_urls),
	execute: async ({ ids, media_urls }, ctx) => {
		const lines: string[] = [];
		if (ids !== undefined || media_urls === undefined) {
			const { queued, skipped } = ctx.generateCaptions(ids);
			lines.push(
				queued.length
					? `Captioning ${queued.join(", ")}.`
					: "Nothing to caption.",
				...skipped.map(({ id, reason }) => `Skipped ${id}: it ${reason}.`),
			);
		}
		for (const url of media_urls ?? []) {
			try {
				const { name, wordCount } = await ctx.generateMediaCaptions(url);
				lines.push(
					wordCount
						? `Captions ready for ${name} (${wordCount} words). Call view_media with ${url} to read the word timings.`
						: `No speech was found in ${name}; an empty transcript was saved.`,
				);
			} catch (error) {
				lines.push(`Skipped ${url}: ${errorMessage(error)}`);
			}
		}
		return lines.join("\n");
	},
});
