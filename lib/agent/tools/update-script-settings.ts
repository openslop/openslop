import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { LANGUAGE_CHOICES, languageLabel } from "@/lib/project/language";
import {
	VIDEO_LENGTHS,
	VIDEO_LENGTH_SPECS,
	VIDEO_LENGTH_TARGETS,
} from "@/lib/project/video-length";
import {
	VIDEO_FORMAT_CHOICES,
	VIDEO_FORMAT_SPECS,
	VIDEO_FORMAT_TARGETS,
} from "@/lib/project/video-format";
import { Hourglass } from "@/components/ui/icon";
import { conjunction } from "@/lib/format";
import { defineTool } from "./define-tool";
import { atLeastOne } from "./inputs";

export const updateScriptSettings = defineTool({
	description: dedent`
	  Store the language, length and format the script should have, so you remember them; the
	  script tools read them from here. adapt_script keeps the user's words, so only the
	  language applies to it. Send only what changes.

	  - language: what narration and dialogue are written in. "auto" follows whatever language
	    the user writes in. ${LANGUAGE_CHOICES.map((choice) => `${choice} (${languageLabel(choice)})`).join(", ")}
	  - length: how long the video runs, as a spoken-word budget.
	    - auto: no budget. The script runs as long as the material needs.
	${VIDEO_LENGTH_TARGETS.map((length) => `    - ${length}: ${VIDEO_LENGTH_SPECS[length].minWords} to ${VIDEO_LENGTH_SPECS[length].maxWords} words`).join("\n")}
	  - format: what the script is made of.
	    - auto: not classified yet.
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
	label: "Storing the script settings",
	execute: async (patch, ctx) => {
		ctx.updateScriptSettings(patch);
		const changed = Object.entries(patch).map(
			([key, value]) => `${key} ${value}`,
		);
		return `Stored ${conjunction(changed)}.`;
	},
});
