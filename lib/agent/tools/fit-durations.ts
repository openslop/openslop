import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { sceneLabel } from "@/lib/canvas/constants";
import {
	DURATION_FIT_LEEWAY_SEC,
	durationFits,
	fallsShort,
	type DurationFit,
} from "@/lib/render/duration-fit";
import type { VisualSpan } from "@/lib/render/visual-spans";
import { Hourglass } from "@/components/ui/icon";
import { plural } from "@/lib/format";
import { defineTool, seconds } from "./define-tool";

const where = ({ sceneNumber, type, id }: VisualSpan) =>
	`${sceneLabel(sceneNumber)} ${type} ${id}`;

const changeLine = ({ span, duration, needed }: DurationFit) =>
	`${where(span)}: ${span.duration.sec}s to ${duration}s, for about ${seconds(needed)} of estimated speech and leeway.`;

const shortLine = ({ span, needed }: DurationFit) =>
	`${where(span)} needs about ${seconds(needed)} but ${span.duration.maxSec}s is the longest its model generates; split the speech after it across more visuals.`;

const report = (...lines: (string | false)[]) =>
	lines.filter(Boolean).join("\n");

const isUnfitted = ({ span, duration }: DurationFit) =>
	span.duration.sec !== duration;

const toSetOp = ({ span, duration }: DurationFit) => ({
	op: "set" as const,
	id: span.id,
	attrs: { duration: String(duration) },
});

/** The visuals asked for, and the ids that named none of them. */
const scopeTo = (spans: VisualSpan[], ids?: string[]) => {
	if (!ids?.length) return { scoped: spans, unknown: [] };
	const wanted = new Set(ids);
	const scoped = spans.filter((span) => wanted.has(span.id));
	const found = new Set(scoped.map((span) => span.id));
	return { scoped, unknown: ids.filter((id) => !found.has(id)) };
};

type Counts = Record<"fits" | "changes" | "short" | "applied", number>;

const headline = ({ fits, changes, short, applied }: Counts) => {
	if (fits === 0)
		return "No video element to generate has speech under it in scope. Images stretch to the speech under them; uploaded videos keep their own length.";
	if (changes > 0) return `Fitted ${applied} of ${changes}.`;
	if (short > 0)
		return "Nothing to change: the ones that fall short are already at the longest option.";
	return `All ${fits} already cover their speech; nothing to change.`;
};

export const fitDurations = defineTool({
	description: dedent`
	  Fit every video element to the speech that runs under it: set each one's
	  \`duration\` to just cover the estimated speech that follows it, up to the next visual, plus
	  ${DURATION_FIT_LEEWAY_SEC}s of leeway. Shorter ones freeze or loop under long speech;
	  longer ones hold the next line back until they finish.

	  The speech under a visual is every line between it and the next visual, whether or
	  not a scene boundary falls between them, so this is scoped by element, never by scene.
	  Send \`element_ids\` to fit only those, or nothing (or an empty list) for the whole canvas.

	  Images already stretch, uploaded videos keep their own length, and videos with no
	  speech under them have nothing to fit, so all three are left alone.
	`,
	input: z.object({
		element_ids: z.array(z.string()).optional(),
	}),
	output: z.string(),
	icon: Hourglass,
	label: "Fitting video elements to the speech",
	execute: async ({ element_ids }, ctx) => {
		const { scoped, unknown } = scopeTo(ctx.estimateVisualSpans(), element_ids);
		const fits = durationFits(scoped);
		const changes = fits.filter(isUnfitted);
		const short = fits.filter(fallsShort);
		const leftAlone = scoped.length - fits.length;

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
			leftAlone > 0 &&
				`${leftAlone} ${plural(leftAlone, "image")} or ${plural(leftAlone, "video")} left alone.`,
			unknown.length > 0 &&
				`Not a visual on the canvas: ${unknown.join(", ")}. Read the script again.`,
			failures.length > 0 &&
				`Failed: ${failures.join("; ")}. Read the script before retrying.`,
		);
	},
	draftsScript: true,
});
