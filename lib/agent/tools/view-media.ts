import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { Eye } from "@/components/ui/icon";
import { requireMedia } from "@/lib/project/media";
import { ResultViewSchema } from "../element-result";
import { defineTool, imageOutput } from "./define-tool";
import { describeResult } from "./view-result";

const MediaViewSchema = ResultViewSchema.extend({ name: z.string() });

type MediaView = z.infer<typeof MediaViewSchema>;

const describeMedia = ({ name, ...view }: MediaView) =>
	`${name}\n${describeResult(view)}`;

export const viewMedia = defineTool({
	description: dedent`
	  Look at files from read_media, every one you need in a single call so you see them side
	  by side. An image comes back as itself, a video as a few timed frames plus its length,
	  and audio as its length.
	`,
	input: z.object({
		urls: z
			.array(z.url())
			.min(1)
			.describe("The files' URLs, exactly as read_media gives them."),
	}),
	output: z.array(MediaViewSchema),
	icon: Eye,
	toModelOutput: ({ output }) =>
		imageOutput(
			output.map(describeMedia).join("\n\n"),
			...output.flatMap(({ pictures }) => pictures.map(({ url }) => url)),
		),
	snapshot: true,
	label: "Looking at the media library",
	execute: async ({ urls }, ctx) => {
		const media = ctx.readProject().media;
		return Promise.all(
			urls.map(async (url) => {
				const item = requireMedia(media, url);
				return { name: item.name, ...(await ctx.viewMedia(item)) };
			}),
		);
	},
});
