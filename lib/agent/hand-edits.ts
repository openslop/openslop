import type { Descendant } from "slate";
import { z } from "zod";
import { getCanvasElements } from "@/lib/canvas/assets";
import { serializeElement } from "@/lib/canvas/osml-serializer";

/** What the user changed on the canvas, element by element, as OSML tags. */
export const handEditsSchema = z.object({
	changed: z.array(z.object({ before: z.string(), after: z.string() })),
	added: z.array(z.string()),
	removed: z.array(z.string()),
});
export type HandEdits = z.infer<typeof handEditsSchema>;

const tagsById = (nodes: Descendant[]) =>
	new Map(
		getCanvasElements(nodes).map((element) => [
			element.id,
			serializeElement(element),
		]),
	);

/** The edits that take `before` to `after`; null when nothing changed. */
export function diffCanvas(
	before: Descendant[],
	after: Descendant[],
): HandEdits | null {
	const was = tagsById(before);
	const now = tagsById(after);
	const edits: HandEdits = {
		changed: [...now].flatMap(([id, tag]) => {
			const earlier = was.get(id);
			return earlier === undefined || earlier === tag
				? []
				: [{ before: earlier, after: tag }];
		}),
		added: [...now].filter(([id]) => !was.has(id)).map(([, tag]) => tag),
		removed: [...was].filter(([id]) => !now.has(id)).map(([, tag]) => tag),
	};
	const count =
		edits.changed.length + edits.added.length + edits.removed.length;
	return count === 0 ? null : edits;
}

/** The note the model reads in place of the data part. */
export function describeHandEdits({
	changed,
	added,
	removed,
}: HandEdits): string {
	return [
		"The user edited the canvas by hand since your last turn:",
		...changed.map(
			({ before, after }) => `- changed: ${before}\n  to: ${after}`,
		),
		...added.map((tag) => `- added: ${tag}`),
		...removed.map((tag) => `- removed: ${tag}`),
	].join("\n");
}
