import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { LANGUAGE_CHOICES, languageLabel } from "@/lib/project/language";
import {
	VIDEO_LENGTHS,
	VIDEO_LENGTH_SPECS,
	VIDEO_LENGTH_TARGETS,
} from "@/lib/project/videoLength";
import {
	VIDEO_FORMAT_CHOICES,
	VIDEO_FORMAT_SPECS,
	VIDEO_FORMAT_TARGETS,
} from "@/lib/project/videoFormat";
import { Hourglass } from "@/components/ui/icon";
import { defineTool } from "./defineTool";
import { atLeastOne } from "./inputs";

export const updateScriptSettings = defineTool({
	description: dedent`
	  Change how the next script is written: its language, length and format. Send only what
	  changes. Nothing on the canvas changes; to change what is there, update the setting and
	  then edit_script.

	  - language: what narration and dialogue are written in. "auto" follows whatever language
	    the user writes in. ${LANGUAGE_CHOICES.map((choice) => `${choice} (${languageLabel(choice)})`).join(", ")}
	  - length: how long the video runs, as the spoken-word budget the next script is held to.
	    - auto: no budget. The script runs as long as the material needs.
	${VIDEO_LENGTH_TARGETS.map((length) => `    - ${length}: ${VIDEO_LENGTH_SPECS[length].minWords} to ${VIDEO_LENGTH_SPECS[length].maxWords} words`).join("\n")}
	  - format: what the next script is made of. Set one only when the user asks for it.
	    - auto: the writer picks the format closest to the brief.
	${VIDEO_FORMAT_TARGETS.map((format) => `    - ${format}: ${VIDEO_FORMAT_SPECS[format].summary}`).join("\n")}
	`,
	input: z
		.object({
			language: z.enum(LANGUAGE_CHOICES).optional(),
			length: z.enum(VIDEO_LENGTHS).optional(),
			format: z.enum(VIDEO_FORMAT_CHOICES).optional(),
		})
		.refine(...atLeastOne("script setting")),
	output: z.string(),
	icon: Hourglass,
	label: "Updating the script settings",
	execute: async (patch, ctx) => {
		ctx.updateScriptSettings(patch);
		const changed = Object.entries(patch).map(
			([key, value]) => `${key} to ${value}`,
		);
		return `Set the ${changed.join(" and ")}. It applies to the next script written; what is on the canvas is unchanged.`;
	},
});
