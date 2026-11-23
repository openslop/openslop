"use client";

import {
	useMemo,
	useRef,
	useState,
	type ComponentProps,
	type ReactNode,
} from "react";
import { Timeline as TimelineIcon } from "@/components/ui/icon";
import { renderPrompt } from "@/lib/connectors/character-refs";
import { toFrames } from "@/lib/render/frames";
import { clamp, cn } from "@/lib/utils";
import { usePlayerControl } from "../player-control-context";
import { usePlayerScrub } from "../use-player-scrub";
import { useSelectScene } from "../use-select-scene";
import { useLayout } from "../render-layout-context";
import {
	ClipOutline,
	TimelineCaptionClip,
	TimelineClip,
	TimelineExtension,
	TimelinePlaceholderClip,
} from "./timeline-clip";
import { TimelineHoverHead, type HoverHeadHandle } from "./timeline-hover-head";
import { TimelinePlayhead } from "./timeline-playhead";
import { TimelineSnapGuide } from "./timeline-snap-guide";
import { LANE_HEIGHT } from "../dock-layout";
import { TimelineRuler } from "./timeline-ruler";
import {
	buildCaptionRows,
	buildTimelineRows,
	type CaptionClip as CaptionClipData,
	type PlaceholderClip as PlaceholderClipData,
	type TimelineClip as TimelineClipData,
} from "./timeline-rows";
import { RULER_TAIL_PX, useTimelineZoomContext } from "./timeline-zoom-context";
import { TimelineTrimHandles } from "./timeline-trim-handle";
import { useClipTrim } from "./use-clip-trim";
import { useTrimSnap, type TrimSnap } from "./use-trim-snap";
import { Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { insertElement } from "@/lib/canvas/insert-element";
import { findElementById } from "@/lib/canvas/editor-ops";
import { isScene } from "@/lib/canvas/scenes";

const MIN_CLIP_WIDTH_PX = 2;

type ClipProps<T> = {
	clip: T;
	pxPerSec: number;
	selected: boolean;
	onSelect: (clip: T) => void;
};

/** Each clip stacks as one, a later clip over an earlier, the selected one over both. */
function ClipSlot({
	start,
	width,
	className,
	...props
}: { start: number; width: number } & ComponentProps<"li">) {
	return (
		<li
			{...props}
			className={cn("group/clip absolute inset-y-0.5 isolate", className)}
			style={{ left: start, width }}
		/>
	);
}

function SelectButton({
	selected,
	...props
}: { selected: boolean } & Pick<
	ComponentProps<"button">,
	"onClick" | "tabIndex" | "children"
>) {
	return (
		<button
			{...props}
			type="button"
			aria-current={selected ? "true" : undefined}
			// Inline buttons sit on the list item's text baseline, which
			// drops the clip past its lane.
			className="block h-full w-full rounded-md focus-ring"
		/>
	);
}

function Clip({
	clip,
	pxPerSec,
	numbered,
	snap,
	selected,
	onSelect,
}: ClipProps<TimelineClipData> & { numbered: boolean; snap: TrimSnap }) {
	const { trim, trimming, extensionSec, handleProps } = useClipTrim(
		clip,
		pxPerSec,
		snap,
	);
	const width = Math.max(trim.trimDurationSec * pxPerSec, MIN_CLIP_WIDTH_PX);
	const extensionWidth = extensionSec * pxPerSec;
	const extensionStart = clip.start + trim.trimDurationSec;
	return (
		<>
			<ClipSlot
				start={clip.start * pxPerSec}
				width={width}
				className={selected && !trimming ? "z-10" : undefined}
			>
				<SelectButton selected={selected} onClick={() => onSelect(clip)}>
					<TimelineClip
						clip={clip}
						width={width}
						label={renderPrompt(clip.element.prompt)}
						selected={selected}
						sceneNumber={numbered ? clip.element.sceneNumber : undefined}
						pxPerSec={pxPerSec}
						trim={trim}
					/>
				</SelectButton>
				<TimelineTrimHandles handleProps={handleProps} />
			</ClipSlot>
			{trimming ? (
				<ClipSlot
					start={clip.start * pxPerSec}
					width={width}
					aria-hidden="true"
					className="pointer-events-none z-10"
				>
					<ClipOutline element={clip.element} selected={selected} />
				</ClipSlot>
			) : null}
			{extensionWidth >= MIN_CLIP_WIDTH_PX ? (
				<ClipSlot start={extensionStart * pxPerSec} width={extensionWidth}>
					{/* The clip before it already selects the scene from the keyboard. */}
					<SelectButton
						selected={selected}
						onClick={() => onSelect(clip)}
						tabIndex={-1}
					>
						<TimelineExtension
							element={clip.element}
							start={extensionStart}
							duration={extensionSec}
							clipWidth={width}
							width={extensionWidth}
							selected={selected}
						/>
					</SelectButton>
				</ClipSlot>
			) : null}
		</>
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

function PlaceholderClip({
	placeholder,
	pxPerSec,
	onInsert,
}: {
	placeholder: PlaceholderClipData;
	pxPerSec: number;
	onInsert: (placeholder: PlaceholderClipData) => void;
}) {
	const startPx = placeholder.start * pxPerSec;
	const widthPx = Math.max(MIN_CLIP_WIDTH_PX, placeholder.duration * pxPerSec);

	return (
		<ClipSlot start={startPx} width={widthPx}>
			<TimelinePlaceholderClip
				placeholder={placeholder}
				width={widthPx}
				onClick={() => onInsert(placeholder)}
			/>
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
		<div
			className={cn(
				"relative border-b border-border/50",
				LANE_HEIGHT[row.kind],
			)}
		>
			<ul aria-label={row.label} className="absolute inset-0">
				{children}
			</ul>
		</div>
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
	const editor = useSlateStatic();
	const { layout } = useLayout();
	const { player } = usePlayerControl();
	const selectScene = useSelectScene();
	const [selectedKey, setSelectedKey] = useState<string | null>(null);
	const hoverHead = useRef<HoverHeadHandle>(null);
	const rows = useMemo(() => buildTimelineRows(layout), [layout]);
	const captionRows = useMemo(() => buildCaptionRows(layout), [layout]);
	const { snap, guide: snapGuide } = useTrimSnap(rows, layout.fps);
	const { viewportRef, pxPerSec } = useTimelineZoomContext();

	const scrub = usePlayerScrub();
	const seek = (seconds: number) =>
		scrub.seekTo(
			toFrames(clamp(seconds, 0, layout.totalDurationSec), layout.fps),
		);

	const select = (clip: TimelineClipData) => {
		setSelectedKey(clip.key);
		selectScene(clip.element.sceneId, clip.start);
	};

	const handleInsertPlaceholder = (placeholder: PlaceholderClipData) => {
		const sceneIndex = editor.children.findIndex(
			(node) => isScene(node) && node.id === placeholder.sceneId,
		);
		const targetIndex = sceneIndex >= 0 ? sceneIndex : 0;
		const scene = editor.children[targetIndex];
		const childCount = isScene(scene) ? scene.children.length : 0;
		const insertPath = [targetIndex, childCount];

		const newId = insertElement(editor, placeholder.type, insertPath);

		const found = findElementById(editor, newId);
		if (found) {
			Transforms.select(editor, found[1]);
		}

		selectScene(placeholder.sceneId, placeholder.start);
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
						gridTemplateColumns: `${
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
							clamp(x / pxPerSec, 0, layout.totalDurationSec),
						);
					}}
					onPointerLeave={() => hoverHead.current?.hide()}
				>
					<div
						style={{ gridArea: "1 / 1" }}
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

					<div style={{ gridArea: "2 / 1" }}>
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
								{row.placeholders?.map((placeholder) => (
									<PlaceholderClip
										key={placeholder.key}
										placeholder={placeholder}
										pxPerSec={pxPerSec}
										onInsert={handleInsertPlaceholder}
									/>
								))}
								{row.clips.map((clip) => (
									<Clip
										key={clip.key}
										clip={clip}
										pxPerSec={pxPerSec}
										numbered={row.numbered}
										snap={snap}
										selected={selectedKey === clip.key}
										onSelect={select}
									/>
								))}
							</Track>
						))}
					</div>

					{/* Spans both rows so the heads run through the ruler. */}
					<div
						style={{ gridArea: "1 / 1 / 3 / 2" }}
						className="pointer-events-none relative z-20"
					>
						<TimelineHoverHead ref={hoverHead} pxPerSec={pxPerSec} />
						<TimelineSnapGuide ref={snapGuide} pxPerSec={pxPerSec} />
						<TimelinePlayhead />
					</div>
				</div>
			)}
		</section>
	);
}
