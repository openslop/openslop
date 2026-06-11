import type { RefineOp } from "./types";

const TYPE_LABELS: Record<string, [singular: string, plural: string]> = {
	image: ["image", "images"],
	animated_image: ["animated image", "animated images"],
	narration: ["narration", "narrations"],
	character: ["character line", "character lines"],
	music: ["music cue", "music cues"],
	sound: ["sound", "sounds"],
	clip: ["clip", "clips"],
};

const ATTR_LABELS: Record<string, string> = {
	motion: "motion",
	captions: "captions",
	emotion: "emotion",
	speed: "narration speed",
	volume: "volume",
	characters: "characters",
	overlays: "overlays",
	videoPrompt: "animation",
	loops: "looping",
};

const label = (type: string, n: number): string => {
	const pair = TYPE_LABELS[type];
	if (!pair) return n === 1 ? "element" : "elements";
	return n === 1 ? pair[0] : pair[1];
};

const plural = (n: number, word: string): string =>
	`${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * Human-readable summary of a staged refine change, built from the ops alone
 * (element-level, so the summary is accurate but coarse — counts grouped by
 * kind, with notable attribute names called out). Used in the confirm card.
 */
export function summarizeRefineOps(ops: RefineOp[]): string {
	if (ops.length === 0) return "No changes suggested.";

	const added: Record<string, number> = {};
	let removed = 0;
	let textEdits = 0;
	const attrCounts: Record<string, number> = {};

	for (const op of ops) {
		if (op.op === "insert") {
			added[op.type] = (added[op.type] ?? 0) + 1;
		} else if (op.op === "remove") {
			removed += 1;
		} else {
			if (op.text !== undefined) textEdits += 1;
			if (op.attrs) {
				for (const key of Object.keys(op.attrs)) {
					attrCounts[key] = (attrCounts[key] ?? 0) + 1;
				}
			}
		}
	}

	const parts: string[] = [];
	const addedParts = Object.entries(added).map(
		([type, n]) => `${n} ${label(type, n)}`,
	);
	if (addedParts.length > 0) parts.push(`added ${addedParts.join(", ")}`);
	if (textEdits > 0) parts.push(`rewrote ${plural(textEdits, "line")}`);
	for (const [attr, n] of Object.entries(attrCounts)) {
		parts.push(`set ${ATTR_LABELS[attr] ?? attr} on ${plural(n, "element")}`);
	}
	if (removed > 0) parts.push(`removed ${plural(removed, "element")}`);

	if (parts.length === 0) return "No changes suggested.";

	const joined =
		parts.length === 1
			? parts[0]
			: `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
	return `${joined.charAt(0).toUpperCase()}${joined.slice(1)}.`;
}
