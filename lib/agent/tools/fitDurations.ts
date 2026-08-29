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
import { Hourglass } from "@/components/ui/icon";
import { defineTool } from "./defineTool";

const sec = (seconds: number) => `${seconds.toFixed(1)}s`;

const where = ({ sceneNumber, type, id }: ElementLength) =>
	`Scene ${sceneNumber} ${type} ${id}`;

const changeLine = ({ length, duration, needed }: DurationFit) =>
	`${where(length)}: ${length.durationSec}s to ${duration}s, for ${sec(needed)} of dialogue and leeway.`;

const shortLine = ({ length, needed }: DurationFit) =>
	`${where(length)} needs ${sec(needed)} but ${DURATION_MAX}s is the longest a clip can be generated at; split the dialogue after it across more visuals.`;

const report = (...lines: (string | false)[]) =>
	lines.filter(Boolean).join("\n");

const isUnfitted = ({ length, duration }: DurationFit) =>
	length.durationSec !== duration;

const toSetOp = ({ length, duration }: DurationFit) => ({
	op: "set" as const,
	id: length.id,
	attrs: { duration: String(duration) },
});

/** The visuals asked for, and the ids that named none of them. */
const scopeTo = (lengths: ElementLength[], ids?: string[]) => {
	if (!ids) return { scoped: lengths, unknown: [] };
	const wanted = new Set(ids);
	const scoped = lengths.filter((length) => wanted.has(length.id));
	const found = new Set(scoped.map((length) => length.id));
	return { scoped, unknown: ids.filter((id) => !found.has(id)) };
};

type Counts = Record<"fits" | "changes" | "short" | "applied", number>;

const headline = ({ fits, changes, short, applied }: Counts) => {
	if (fits === 0)
		return "No animated_image or clip in scope. Images carry no duration and already stretch to the dialogue under them.";
	if (changes > 0)
		return `Fitted ${applied} of ${changes}. Those elements are stale now and need regenerating.`;
	if (short > 0)
		return "Nothing to change: the ones that fall short are already at the longest option.";
	return `All ${fits} already cover their dialogue; nothing to change.`;
};

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
	icon: Hourglass,
	label: "Fitting clips to the dialogue",
	execute: async ({ element_ids }, ctx) => {
		const { scoped, unknown } = scopeTo(
			ctx.measureElementLengths(),
			element_ids,
		);
		const fits = durationFits(scoped);
		const changes = fits.filter(isUnfitted);
		const short = fits.filter(fallsShort);
		const stills = scoped.length - fits.length;

		const { applied, failures } = changes.length
			? ctx.editScript(changes.map(toSetOp))
			: { applied: 0, failures: [] };

		return report(
			headline({
				fits: fits.length,
				changes: changes.length,
				short: short.length,
				applied,
			}),
			...changes.map(changeLine),
			...short.map(shortLine),
			stills > 0 &&
				`${stills} image still${stills === 1 ? "" : "s"} left alone.`,
			unknown.length > 0 &&
				`Not a visual on the canvas: ${unknown.join(", ")}. Read the script again.`,
			failures.length > 0 &&
				`Failed: ${failures.join("; ")}. Read the script again; the ids may be stale.`,
		);
	},
	rewritesCanvas: true,
});
