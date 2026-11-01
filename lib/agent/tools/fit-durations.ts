import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { sceneLabel } from "@/lib/canvas/constants";
import { DURATION_MAX } from "@/lib/canvas/types";
import {
	DURATION_FIT_LEEWAY_SEC,
	durationFits,
	fallsShort,
	heldByTrim,
	type DurationFit,
	type TrimmedLength,
} from "@/lib/render/duration-fit";
import { hasDialogue, type ElementLength } from "@/lib/render/element-lengths";
import { Hourglass } from "@/components/ui/icon";
import { plural } from "@/lib/format";
import { defineTool, seconds } from "./define-tool";

const where = ({ sceneNumber, type, id }: ElementLength) =>
	`${sceneLabel(sceneNumber)} ${type} ${id}`;

const changeLine = ({ length, duration, needed }: DurationFit) =>
	`${where(length)}: ${length.durationSec}s to ${duration}s, for ${seconds(needed)} of dialogue and leeway.`;

const shortLine = ({ length, needed }: DurationFit) =>
	`${where(length)} needs ${seconds(needed)} but ${DURATION_MAX}s is the longest a video element can be generated at; split the dialogue after it across more visuals.`;

const trimmedLine = (length: TrimmedLength) =>
	`${where(length)} is trimmed to ${seconds(length.trimmedSec)} on the timeline, which \`duration\` cannot move; left alone until the user resets the trim.`;

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

type Counts = Record<
	"fits" | "changes" | "short" | "applied" | "trimmed",
	number
>;

const headline = ({ fits, changes, short, applied, trimmed }: Counts) => {
	if (fits === 0 && trimmed > 0)
		return "Nothing to fit: every video with dialogue under it is trimmed on the timeline.";
	if (fits === 0)
		return "No video elements with dialogue under them in scope. Images already stretch to the dialogue under them.";
	if (changes > 0)
		return `Fitted ${applied} of ${changes}. Those elements are stale now and need regenerating.`;
	if (short > 0)
		return "Nothing to change: the ones that fall short are already at the longest option.";
	return `All ${fits} already cover their dialogue; nothing to change.`;
};

export const fitDurations = defineTool({
	description: dedent`
	  Fit every video element to the dialogue that runs under it: set each one's
	  \`duration\` to just cover the speech that follows it, up to the next visual, plus
	  ${DURATION_FIT_LEEWAY_SEC}s of leeway. Shorter ones freeze or loop under long dialogue;
	  longer ones hold the next line back until they finish.

	  The dialogue under a visual is every line between it and the next visual, whether or
	  not a scene boundary falls between them, so this is scoped by element, never by scene.
	  Send \`element_ids\` to fit only those, or nothing for the whole canvas.

	  Images already stretch, and videos with no dialogue under them have nothing to fit,
	  so both are left alone. Changing a duration stales the element: tell the user to
	  regenerate it afterwards.
	`,
	input: z.object({
		element_ids: z.array(z.string()).min(1).optional(),
	}),
	output: z.string(),
	icon: Hourglass,
	label: "Fitting video elements to the dialogue",
	execute: async ({ element_ids }, ctx) => {
		const { scoped, unknown } = scopeTo(
			ctx.measureElementLengths(),
			element_ids,
		);
		const fits = durationFits(scoped);
		const changes = fits.filter(isUnfitted);
		const short = fits.filter(fallsShort);
		const trimmed = scoped.filter(heldByTrim).filter(hasDialogue);
		const leftAlone = scoped.length - fits.length - trimmed.length;

		const { applied, failures } = changes.length
			? ctx.editScript(changes.map(toSetOp))
			: { applied: 0, failures: [] };

		return report(
			headline({
				fits: fits.length,
				changes: changes.length,
				short: short.length,
				applied,
				trimmed: trimmed.length,
			}),
			...changes.map(changeLine),
			...short.map(shortLine),
			...trimmed.map(trimmedLine),
			leftAlone > 0 &&
				`${leftAlone} ${plural(leftAlone, "image")} or ${plural(leftAlone, "video")} without dialogue left alone.`,
			unknown.length > 0 &&
				`Not a visual on the canvas: ${unknown.join(", ")}. Read the script again.`,
			failures.length > 0 &&
				`Failed: ${failures.join("; ")}. Read the script again; the ids may be stale.`,
		);
	},
	draftsScript: true,
});
