import type { ContentType, ElementRole, LayerType } from "@/lib/canvas/types";
import {
	layoutCaptions,
	type CaptionSequence,
} from "@/lib/render/caption-rule";
import { allSequences, totalDuration } from "@/lib/render/sequences";
import type { Sequence, RenderLayout } from "@/lib/render/types";
import { keysOf } from "@/lib/utils";

export type TimelineClip = Sequence & { key: string };

export type PlaceholderKind = {
	role: ElementRole;
	type: ContentType;
	label: string;
};

export const PLACEHOLDER_KINDS: PlaceholderKind[] = [
	{ role: "background", type: "music", label: "Add music" },
];

export type PlaceholderClip = {
	key: string;
	role: ElementRole;
	type: ContentType;
	label: string;
	start: number;
	duration: number;
	sceneId: string;
};

export type TimelineRow = {
	key: string;
	id: ElementRole;
	label: string;
	kind: LayerType;
	/** Only the scene lane carries scene numbers; the rest sit under it unlabelled. */
	numbered: boolean;
	clips: TimelineClip[];
	placeholders?: PlaceholderClip[];
};

/** One lane per role, in stacking order, mirroring `buildRenderLayout`'s cases. */
const ROWS: Record<
	ElementRole,
	{ label: string; kind: LayerType; numbered: boolean }
> = {
	foreground: { label: "Visuals", kind: "visual", numbered: true },
	overlay: { label: "Speech", kind: "audio", numbered: false },
	effect: { label: "Effects", kind: "audio", numbered: false },
	background: { label: "Music", kind: "audio", numbered: false },
};

const CAPTION_ROW = {
	label: "Captions",
	kind: "captions",
} as const;

// Clips accumulated on the frame grid land a few ULPs apart, so a hair of
// overlap still counts as a touch.
const TOUCH_EPSILON = 1e-6;

function sequencesForRole(layout: RenderLayout, role: ElementRole): Sequence[] {
	return allSequences(layout)
		.filter((sequence) => sequence.element.role === role)
		.sort((a, b) => a.start - b.start);
}

/** Computes UI-only placeholder clips for uncovered tracks (e.g. initial music gap). */
export function computePlaceholderClips(
	layout: RenderLayout,
): PlaceholderClip[] {
	if (layout.totalDurationSec <= 0 || layout.series.length === 0) {
		return [];
	}

	const placeholders: PlaceholderClip[] = [];

	// Music placeholder
	const musicSequences = sequencesForRole(layout, "background");
	const firstMusic = musicSequences[0];
	const firstSceneId = layout.series[0]?.element.sceneId;

	if (!firstMusic) {
		placeholders.push({
			key: "placeholder-music-0",
			role: "background",
			type: "music",
			label: "Add music",
			start: 0,
			duration: layout.totalDurationSec,
			sceneId: firstSceneId,
		});
	} else if (firstMusic.start > TOUCH_EPSILON) {
		placeholders.push({
			key: "placeholder-music-0",
			role: "background",
			type: "music",
			label: "Add music",
			start: 0,
			duration: firstMusic.start,
			sceneId: firstSceneId,
		});
	}

	return placeholders;
}

/**
 * Splits clips into as few lanes as they can occupy without overlapping, the
 * way a linear editor stacks simultaneous sounds. Expects clips in start order.
 *
 * `toleranceSec` is the overlap that doesn't count as one: audio either side of
 * a scene boundary runs into its neighbour by the cross-fade without ever
 * really playing over it.
 */
export function packLanes<
	T extends Pick<Sequence, "start" | "duration" | "minDuration">,
>(clips: T[], toleranceSec = 0): T[][] {
	const lanes: T[][] = [];
	for (const clip of clips) {
		const lane = lanes.find((candidate) => {
			const last = candidate[candidate.length - 1];
			return (
				last.start + totalDuration(last) - toleranceSec - TOUCH_EPSILON <=
				clip.start
			);
		});
		if (lane) lane.push(clip);
		else lanes.push([clip]);
	}
	return lanes;
}

/** Roles with nothing to show and no placeholders are dropped. */
export function buildTimelineRows(layout: RenderLayout): TimelineRow[] {
	const placeholders = computePlaceholderClips(layout);

	return keysOf(ROWS).flatMap((role) => {
		const sequences = sequencesForRole(layout, role);
		const rolePlaceholders = placeholders.filter((p) => p.role === role);

		if (sequences.length === 0 && rolePlaceholders.length === 0) {
			return [];
		}

		const lanes = packLanes(sequences, layout.transitionDurationSec);

		if (lanes.length === 0 && rolePlaceholders.length > 0) {
			return [
				{
					key: `${role}-0`,
					id: role,
					...ROWS[role],
					clips: [],
					placeholders: rolePlaceholders,
				},
			];
		}

		return lanes.map((lane, index) => ({
			key: `${role}-${index}`,
			id: role,
			...ROWS[role],
			clips: lane.map((sequence) => ({
				...sequence,
				key: `${sequence.element.id}-${sequence.start}`,
			})),
			...(index === 0 && rolePlaceholders.length > 0
				? { placeholders: rolePlaceholders }
				: {}),
		}));
	});
}

export type CaptionClip = CaptionSequence & { key: string };

export type CaptionRow = {
	key: string;
	label: string;
	kind: "captions";
	clips: CaptionClip[];
};

export function buildCaptionRows(layout: RenderLayout): CaptionRow[] {
	const clips = layoutCaptions(layout).map((caption) => ({
		...caption,
		key: `${caption.element.id}-${caption.start}`,
	}));
	return packLanes(clips).map((lane, index) => ({
		key: `captions-${index}`,
		...CAPTION_ROW,
		clips: lane,
	}));
}
