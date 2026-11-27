import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { Film } from "@/components/ui/icon";
import { VideoSettingsSchema } from "@/lib/project/video-settings";
import { defineTool } from "./define-tool";

export const readVideoSettings = defineTool({
	description: dedent`
	  Read how the video looks: its aspect ratio, transitions, captions and their style, and
	  film effects, as update_video_settings sets them.
	`,
	input: z.object({}),
	output: VideoSettingsSchema,
	icon: Film,
	label: "Reading video settings",
	execute: async (_input, ctx) => ctx.readProject().videoSettings,
	retention: "turn",
});
