import {
	Captions,
	Film,
	Music,
	Voice,
	Waveform,
	type IconComponent,
} from "@/components/ui/icon";
import type { ElementRole, LayerType } from "@/lib/canvas/types";
import { secUntilNextScene } from "@/lib/render/sequences";
import {
	layoutCaptions,
	type CaptionSequence,
} from "@/lib/render/caption-rule";
import type { Sequence, RenderLayout } from "@/lib/render/types";

export type TimelineClip = Sequence & { key: string };

export type TimelineRow = {
	key: string;
	id: ElementRole;
	label: string;
	icon: IconComponent;
	kind: LayerType;
	/** Only the scene lane carries scene numbers; the rest sit under it unlabelled. */
	numbered: boolean;
	clips: TimelineClip[];
};

/** One lane per role, in stacking order, mirroring `buildRenderLayout`'s cases. */
const ROWS: Record<
	ElementRole,
	{ label: string; icon: IconComponent; kind: LayerType; numbered: boolean }
> = {
	foreground: { label: "Visuals", icon: Film, kind: "visual", numbered: true },
	overlay: { label: "Voice", icon: Voice, kind: "audio", numbered: false },
	effect: { label: "Effects", icon: Waveform, kind: "audio", numbered: false },
	background: { label: "Music", icon: Music, kind: "audio", numbered: false },
};

const CAPTION_ROW = {
	label: "Captions",
	icon: Captions,
	kind: "captions",
} as const;

// Clips accumulated on the frame grid land a few ULPs apart, so a hair of
// overlap still counts as a touch.
const TOUCH_EPSILON = 1e-6;

function endScenesWhereNextBegins(series: Sequence[]): Sequence[] {
	return series.map((sequence) => ({
		...sequence,
		duration: secUntilNextScene(sequence, series),
	}));
}

function sequencesForRole(layout: RenderLayout, role: ElementRole): Sequence[] {
	if (role === "foreground") return endScenesWhereNextBegins(layout.series);
	return Object.values(layout.sequences)
		.flat()
		.filter((sequence) => sequence.element.role === role)
		.sort((a, b) => a.start - b.start);
}

/**
 * Splits clips into as few lanes as they can occupy without overlapping, the
 * way a linear editor stacks simultaneous sounds. Expects clips in start order.
 *
 * `toleranceSec` is the overlap that doesn't count as one: audio either side of
 * a scene boundary runs into its neighbour by the cross-fade without ever
 * really playing over it.
 */
export function packLanes<T extends Pick<Sequence, "start" | "duration">>(
	clips: T[],
	toleranceSec = 0,
): T[][] {
	const lanes: T[][] = [];
	for (const clip of clips) {
		const lane = lanes.find((candidate) => {
			const last = candidate[candidate.length - 1];
			return (
				last.start + last.duration - toleranceSec - TOUCH_EPSILON <= clip.start
			);
		});
		if (lane) lane.push(clip);
		else lanes.push([clip]);
	}
	return lanes;
}

/** Effects and music can outrun the last scene; the timeline draws the video, not the layout. */
function withinVideo(sequences: Sequence[], totalSec: number): Sequence[] {
	return sequences
		.filter((sequence) => sequence.start < totalSec)
		.map((sequence) => ({
			...sequence,
			duration: Math.min(sequence.duration, totalSec - sequence.start),
		}));
}

/** Roles with nothing to show are dropped. */
export function buildTimelineRows(layout: RenderLayout): TimelineRow[] {
	const roles = Object.keys(ROWS) as ElementRole[];
	return roles.flatMap((role) => {
		const lanes = packLanes(
			withinVideo(sequencesForRole(layout, role), layout.totalDurationSec),
			layout.transitionDurationSec,
		);
		return lanes.map((lane, index) => ({
			key: `${role}-${index}`,
			id: role,
			...ROWS[role],
			clips: lane.map((sequence) => ({
				...sequence,
				key: `${sequence.element.id}-${sequence.start}`,
			})),
		}));
	});
}

export type CaptionClip = CaptionSequence & { key: string };

export type CaptionRow = {
	key: string;
	label: string;
	icon: IconComponent;
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
