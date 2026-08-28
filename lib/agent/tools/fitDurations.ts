import dedent from "dedent";
import { z } from "zod";
import { DURATION_MAX } from "@/lib/canvas/types";
import {
	DURATION_FIT_LEEWAY_SEC,
	durationFits,
	fallsShort,
	type DurationFit,
} from "@/lib/video/durationFit";
import type { ElementLength } from "@/lib/video/elementLengths";
import { defineTool } from "./defineTool";

const sec = (seconds: number) => `${seconds.toFixed(1)}s`;

const where = ({ sceneNumber, type, id }: ElementLength) =>
	`Scene ${sceneNumber} ${type} ${id}`;

const changeLine = ({ length, duration, needed }: DurationFit) =>
	`${where(length)}: ${length.durationSec}s to ${duration}s, for ${sec(needed)} of dialogue and leeway.`;

const shortLine = ({ length, needed }: DurationFit) =>
	`${where(length)} needs ${sec(needed)} but ${DURATION_MAX}s is the longest a clip can be generated at; split the dialogue after it across more visuals.`;

export const fitDurations = defineTool({
	description: dedent`
	  Fit every animated_image and clip to the dialogue that runs under it: set each one's
	  \`duration\` to just cover the speech that follows it, up to the next visual, plus
	  ${DURATION_FIT_LEEWAY_SEC}s of leeway. Shorter clips stop dead under long dialogue;
	  longer ones are generated video nobody sees.

	  The dialogue under a visual is every line between it and the next visual, whether or
	  not a scene boundary falls between them, so this is scoped by element, never by scene.
	  Send \`element_ids\` to fit only those, or nothing for the whole canvas.

	  Images carry no duration and already stretch, so they are left alone. Changing a
	  duration stales the element: tell the user to regenerate it afterwards.
	`,
	input: z.object({
		element_ids: z.array(z.string()).min(1).optional(),
	}),
	output: z.string(),
	execute: async ({ element_ids }, ctx) => {
		const lengths = ctx.measureElementLengths();
		const wanted = element_ids && new Set(element_ids);
		const scoped = wanted
			? lengths.filter((length) => wanted.has(length.id))
			: lengths;
		const found = new Set(scoped.map((length) => length.id));
		const unknown = element_ids?.filter((id) => !found.has(id));

		const unknownLine =
			unknown?.length &&
			`Not a visual on the canvas: ${unknown.join(", ")}. Read the script again.`;

		const fits = durationFits(scoped);
		if (fits.length === 0) {
			return [
				"No animated_image or clip in scope. Images carry no duration and already stretch to the dialogue under them.",
				unknownLine,
			]
				.filter(Boolean)
				.join("\n");
		}

		const changes = fits.filter(
			({ length, duration }) => length.durationSec !== duration,
		);
		const short = fits.filter(fallsShort);
		const stills = scoped.length - fits.length;

		const { applied, failures } = changes.length
			? ctx.editScript(
					changes.map(({ length, duration }) => ({
						op: "set" as const,
						id: length.id,
						attrs: { duration: String(duration) },
					})),
				)
			: { applied: 0, failures: [] };

		return [
			changes.length === 0
				? `All ${fits.length} already cover their dialogue; nothing to change.`
				: `Fitted ${applied} of ${changes.length}. Those elements are stale now and need regenerating.`,
			...changes.map(changeLine),
			...short.map(shortLine),
			stills > 0 &&
				`${stills} image still${stills === 1 ? "" : "s"} left alone.`,
			unknownLine,
			failures.length > 0 &&
				`Failed: ${failures.join("; ")}. Read the script again; the ids may be stale.`,
		]
			.filter(Boolean)
			.join("\n");
	},
	rewritesCanvas: true,
});
