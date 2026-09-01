"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import {
	Timeline as TimelineIcon,
	ZoomIn,
	ZoomOut,
} from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { useElementWidth } from "@/lib/components/useElementWidth";
import type { LayerType } from "@/lib/canvas/types";
import { toFrames } from "@/lib/video/frames";
import { clamp, cn } from "@/lib/utils";
import { usePlayerControl } from "../PlayerControlContext";
import { usePlayerScrub } from "../usePlayerScrub";
import { useSelectScene } from "../useSelectScene";
import { useLayout } from "../VideoLayoutContext";
import { TimelineClip } from "./TimelineClip";
import { TimelineHoverHead, type HoverHeadHandle } from "./TimelineHoverHead";
import { TimelinePlayhead } from "./TimelinePlayhead";
import { RULER_HEIGHT, TimelineRuler } from "./TimelineRuler";
import {
	buildTimelineRows,
	type TimelineClip as TimelineClipData,
	type TimelineRow,
} from "./timelineRows";
import { useTimelineZoom } from "./useTimelineZoom";

const LANE_HEIGHT: Record<LayerType, string> = {
	visual: "h-20",
	audio: "h-16",
};
const GUTTER_PX = 40;
/** Runway past the last tick, so its label isn't cut off by the end. */
const RULER_TAIL_PX = 32;
const MIN_CLIP_WIDTH_PX = 2;

/**
 * A lane's height and rule, shared by the track and the gutter cell beside it.
 * They are drawn in separate grid columns and have to line up exactly.
 */
function Lane({
	kind,
	className,
	children,
}: {
	kind: LayerType;
	className?: string;
	children: ReactNode;
}) {
	return (
		<div
			className={cn("border-b border-border/50", LANE_HEIGHT[kind], className)}
		>
			{children}
		</div>
	);
}

function Track({
	row,
	pxPerSec,
	selectedKey,
	onSelect,
}: {
	row: TimelineRow;
	pxPerSec: number;
	selectedKey: string | null;
	onSelect: (clip: TimelineClipData) => void;
}) {
	return (
		<Lane kind={row.kind} className="relative">
			<ul aria-label={row.label} className="absolute inset-0">
				{row.clips.map((clip) => {
					const width = Math.max(clip.duration * pxPerSec, MIN_CLIP_WIDTH_PX);
					const selected = selectedKey === clip.key;
					return (
						<li
							key={clip.key}
							className="absolute inset-y-0.5"
							style={{ left: clip.start * pxPerSec, width }}
						>
							<button
								type="button"
								aria-current={selected ? "true" : undefined}
								onClick={() => onSelect(clip)}
								// Inline buttons sit on the list item's text baseline, which
								// drops the clip past its lane.
								className="block h-full w-full rounded-md focus-ring"
							>
								<TimelineClip
									clip={clip}
									width={width}
									label={clip.element.prompt}
									selected={selected}
									sceneNumber={
										row.numbered ? clip.element.sceneNumber : undefined
									}
								/>
							</button>
						</li>
					);
				})}
			</ul>
		</Lane>
	);
}

function TimelineEmpty() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-1.5 text-muted-foreground">
			<TimelineIcon size={24} />
			<span className="text-label-xs">
				Generate elements to fill the timeline
			</span>
		</div>
	);
}

export function Timeline() {
	const { layout } = useLayout();
	const { player } = usePlayerControl();
	const selectScene = useSelectScene();
	const [selectedKey, setSelectedKey] = useState<string | null>(null);
	const hoverHead = useRef<HoverHeadHandle>(null);
	const {
		ref: viewportRef,
		node: viewport,
		width: viewportWidth,
	} = useElementWidth<HTMLDivElement>();
	const rows = useMemo(() => buildTimelineRows(layout), [layout]);
	const { zoom, pxPerSec, zoomIn, zoomOut, canZoomIn, canZoomOut } =
		useTimelineZoom(
			layout.totalDurationSec,
			viewportWidth - GUTTER_PX - RULER_TAIL_PX,
		);

	const scrub = usePlayerScrub();
	const seek = (seconds: number) =>
		scrub.seekTo(
			toFrames(clamp(seconds, 0, layout.totalDurationSec), layout.fps),
		);

	const select = (clip: TimelineClipData) => {
		setSelectedKey(clip.key);
		selectScene(clip.element.sceneId, clip.start);
	};

	return (
		<section
			aria-label="Timeline"
			tabIndex={0}
			onKeyDown={(event) => {
				// Buttons inside the panel activate on space; only claim the key
				// when the panel itself holds focus.
				if (event.key !== " " || event.target !== event.currentTarget) return;
				event.preventDefault();
				player?.toggle();
			}}
			className="flex h-full flex-col overflow-hidden focus-ring"
		>
			{rows.length === 0 ? (
				<TimelineEmpty />
			) : (
				<div
					ref={viewportRef}
					className="grid min-h-0 flex-1 overflow-auto"
					style={{
						gridTemplateColumns: `${GUTTER_PX}px ${
							pxPerSec * layout.totalDurationSec + RULER_TAIL_PX
						}px`,
						// Spare height goes to the lanes, not to the ruler.
						gridTemplateRows: "auto 1fr",
					}}
					onPointerMove={(event) => {
						const rect = event.currentTarget.getBoundingClientRect();
						const x =
							event.clientX - rect.left + event.currentTarget.scrollLeft;
						hoverHead.current?.show(
							clamp((x - GUTTER_PX) / pxPerSec, 0, layout.totalDurationSec),
						);
					}}
					onPointerLeave={() => hoverHead.current?.hide()}
				>
					<div
						style={{ gridArea: "1 / 1" }}
						className={cn(
							"sticky top-0 left-0 z-40 flex items-center justify-center border-r border-b border-border bg-element-card",
							RULER_HEIGHT,
						)}
					>
						<TooltipIconButton
							label="Zoom out"
							onClick={zoomOut}
							disabled={!canZoomOut}
							size="sm"
						>
							<ZoomOut size={12} />
						</TooltipIconButton>
						<TooltipIconButton
							label={`Zoom in (${Math.round(zoom * 100)}%)`}
							onClick={zoomIn}
							disabled={!canZoomIn}
							size="sm"
						>
							<ZoomIn size={12} />
						</TooltipIconButton>
					</div>

					<div
						style={{ gridArea: "1 / 2" }}
						className="sticky top-0 z-20 bg-element-card"
					>
						<TimelineRuler
							totalDurationSec={layout.totalDurationSec}
							pxPerSec={pxPerSec}
							onScrub={seek}
							onScrubStart={scrub.start}
							onScrubEnd={scrub.end}
						/>
					</div>

					<div style={{ gridArea: "2 / 2" }}>
						{rows.map((row) => (
							<Track
								key={row.key}
								row={row}
								pxPerSec={pxPerSec}
								selectedKey={selectedKey}
								onSelect={select}
							/>
						))}
					</div>

					{/* Spans both rows so the heads run through the ruler. */}
					<div
						style={{ gridArea: "1 / 2 / 3 / 3" }}
						className="pointer-events-none relative z-20"
					>
						<TimelineHoverHead ref={hoverHead} pxPerSec={pxPerSec} />
						<TimelinePlayhead
							pxPerSec={pxPerSec}
							viewport={viewport}
							viewportWidth={viewportWidth}
							leadingInset={GUTTER_PX}
							scrollable={zoom > 1}
						/>
					</div>

					<div
						style={{ gridArea: "2 / 1" }}
						className="sticky left-0 z-30 border-r border-border bg-element-card"
					>
						{rows.map((row) => (
							<SimpleTooltip key={row.key} label={row.label}>
								<Lane
									kind={row.kind}
									className="flex items-center justify-center text-muted-foreground"
								>
									<row.icon size={14} />
								</Lane>
							</SimpleTooltip>
						))}
					</div>
				</div>
			)}
		</section>
	);
}
