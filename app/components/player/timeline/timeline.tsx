"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import {
	RotateCcw,
	Timeline as TimelineIcon,
	ZoomIn,
	ZoomOut,
} from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { useElementWidth } from "@/lib/components/use-element-width";
import { renderCharacterRefs } from "@/lib/connectors/character-refs";
import { toFrames } from "@/lib/render/frames";
import { clamp, cn } from "@/lib/utils";
import { usePlayerControl } from "../player-control-context";
import { usePlayerScrub } from "../use-player-scrub";
import { useSelectScene } from "../use-select-scene";
import { useLayout } from "../render-layout-context";
import { TimelineCaptionClip, TimelineClip } from "./timeline-clip";
import { TimelineHoverHead, type HoverHeadHandle } from "./timeline-hover-head";
import { TimelinePlayhead } from "./timeline-playhead";
import { GUTTER_PX, LANE_HEIGHT, RULER_HEIGHT } from "../dock-layout";
import { TimelineRuler } from "./timeline-ruler";
import {
	buildCaptionRows,
	buildTimelineRows,
	type CaptionClip as CaptionClipData,
	type TimelineClip as TimelineClipData,
} from "./timeline-rows";
import { useTimelineZoom } from "./use-timeline-zoom";
import { TimelineTrimHandle } from "./timeline-trim-handle";
import { useClipTrim } from "./use-clip-trim";

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
	kind: keyof typeof LANE_HEIGHT;
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

type ClipProps<T> = {
	clip: T;
	pxPerSec: number;
	selected: boolean;
	onSelect: (clip: TimelineClipData) => void;
};

function ClipSlot({
	start,
	width,
	children,
}: {
	start: number;
	width: number;
	children: ReactNode;
}) {
	return (
		<li
			className="group/clip absolute inset-y-0.5"
			style={{ left: start, width }}
		>
			{children}
		</li>
	);
}

function SelectButton({
	selected,
	onClick,
	children,
}: {
	selected: boolean;
	onClick: () => void;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			aria-current={selected ? "true" : undefined}
			onClick={onClick}
			// Inline buttons sit on the list item's text baseline, which
			// drops the clip past its lane.
			className="block h-full w-full rounded-md focus-ring"
		>
			{children}
		</button>
	);
}

function Clip({
	clip,
	pxPerSec,
	numbered,
	selected,
	onSelect,
}: ClipProps<TimelineClipData> & { numbered: boolean }) {
	const trim = useClipTrim(clip, pxPerSec, clip.overlaySec ?? 0);
	const width = Math.max(trim.durationSec * pxPerSec, MIN_CLIP_WIDTH_PX);
	return (
		<ClipSlot start={clip.start * pxPerSec} width={width}>
			<SelectButton selected={selected} onClick={() => onSelect(clip)}>
				<TimelineClip
					clip={clip}
					width={width}
					label={renderCharacterRefs(clip.element.prompt)}
					selected={selected}
					sceneNumber={numbered ? clip.element.sceneNumber : undefined}
					pxPerSec={pxPerSec}
					trim={trim.trim}
				/>
			</SelectButton>
			{trim.reset ? (
				<TooltipIconButton
					label="Reset trim"
					side="bottom"
					size="sm"
					variant="quiet"
					onClick={trim.reset}
					className="absolute top-0.5 right-0.5 z-10 opacity-0 transition-opacity duration-200 group-hover/clip:opacity-100 focus-visible:opacity-100"
				>
					<RotateCcw size={12} />
				</TooltipIconButton>
			) : null}
			<TimelineTrimHandle edge="start" dragProps={trim.handleProps?.start} />
			<TimelineTrimHandle edge="end" dragProps={trim.handleProps?.end} />
		</ClipSlot>
	);
}

function CaptionClip({
	clip,
	pxPerSec,
	selected,
	onSelect,
}: ClipProps<CaptionClipData>) {
	const width = Math.max(clip.duration * pxPerSec, MIN_CLIP_WIDTH_PX);
	return (
		<ClipSlot start={clip.start * pxPerSec} width={width}>
			<SelectButton selected={selected} onClick={() => onSelect(clip)}>
				<TimelineCaptionClip clip={clip} width={width} selected={selected} />
			</SelectButton>
		</ClipSlot>
	);
}

function Track({
	row,
	children,
}: {
	row: { kind: keyof typeof LANE_HEIGHT; label: string };
	children: ReactNode;
}) {
	return (
		<Lane kind={row.kind} className="relative">
			<ul aria-label={row.label} className="absolute inset-0">
				{children}
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
	const captionRows = useMemo(() => buildCaptionRows(layout), [layout]);
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
						{captionRows.map((row) => (
							<Track key={row.key} row={row}>
								{row.clips.map((clip) => (
									<CaptionClip
										key={clip.key}
										clip={clip}
										pxPerSec={pxPerSec}
										selected={selectedKey === clip.key}
										onSelect={select}
									/>
								))}
							</Track>
						))}
						{rows.map((row) => (
							<Track key={row.key} row={row}>
								{row.clips.map((clip) => (
									<Clip
										key={clip.key}
										clip={clip}
										pxPerSec={pxPerSec}
										numbered={row.numbered}
										selected={selectedKey === clip.key}
										onSelect={select}
									/>
								))}
							</Track>
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
						{[...captionRows, ...rows].map((row) => (
							<Lane
								key={row.key}
								kind={row.kind}
								className="flex items-center justify-center text-muted-foreground"
							>
								<row.icon size={14} />
							</Lane>
						))}
					</div>
				</div>
			)}
		</section>
	);
}
