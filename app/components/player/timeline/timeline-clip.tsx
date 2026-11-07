import type { ReactNode } from "react";
import { Captions, type IconComponent } from "@/components/ui/icon";
import { MediaWithSkeleton } from "@/lib/components/media-with-skeleton";
import { ELEMENT_CONFIGS } from "@/app/components/canvas/elements/element-configs";
import { sceneLabel } from "@/lib/canvas/constants";
import type { ResultKind } from "@/lib/canvas/types";
import { LOOP_FACES } from "@/lib/connectors/attributes/common";
import { truncateMiddle } from "@/lib/format";
import { lineText } from "@/lib/captions/caption-layout";
import { formatTimeRange } from "@/lib/render/timestamps";
import type { ResolvedElement, Trim } from "@/lib/render/types";
import { cn } from "@/lib/utils";
import { ClipWaveform } from "./clip-waveform";
import type {
	CaptionClip,
	TimelineClip as TimelineClipData,
} from "./timeline-rows";

const HEADER_ICON_SIZE = 9;
const HEADER_HEIGHT = "h-3.5";
const PX_PER_CHAR = 6;
const MIN_CHARS = 4;

const FRAME =
	"relative flex h-full w-full flex-col overflow-hidden rounded-md border";
const edge = (selected: boolean) =>
	selected ? "border-current/60" : "border-border";

const fit = (text: string, width: number) =>
	truncateMiddle(text, Math.max(MIN_CHARS, Math.floor(width / PX_PER_CHAR)));

const urlAt = (url: string, sec: number) => (sec > 0 ? `${url}#t=${sec}` : url);

function Footage({ outputKind, src }: { outputKind: ResultKind; src: string }) {
	return (
		<div className="relative aspect-square h-full overflow-hidden">
			<MediaWithSkeleton outputKind={outputKind} src={src} alt="" />
		</div>
	);
}

function Preview({
	width,
	children,
}: {
	width?: number;
	children: React.ReactNode;
}) {
	return (
		<div
			className={cn(
				"min-w-0 p-0.5",
				width === undefined ? "flex-1" : "flex-none",
			)}
			style={width === undefined ? undefined : { width }}
		>
			<div className="h-full overflow-hidden rounded-sm timeline-preview-surface">
				{children}
			</div>
		</div>
	);
}

/** A wash over the clip's own colour, so selection shifts it rather than replacing it. */
function SelectedWash() {
	return (
		<span aria-hidden="true" className="absolute inset-0 bg-timeline-active" />
	);
}

function CornerChip({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<span
			className={cn(
				"absolute bottom-0.5 left-0.5 flex h-3.5 max-w-full items-center rounded-tr-sm rounded-bl-sm bg-on-media/65 px-1 text-badge-xs text-on-media-foreground",
				className,
			)}
		>
			{children}
		</span>
	);
}

function ClipHeader({
	icon: Icon,
	label,
	width,
}: {
	icon: IconComponent;
	label: string;
	width: number;
}) {
	return (
		<span
			className={cn(
				"relative z-10 flex shrink-0 items-center gap-1 px-1",
				HEADER_HEIGHT,
			)}
		>
			<Icon size={HEADER_ICON_SIZE} className="shrink-0" />
			<span dir="auto" className="truncate text-badge-xs text-foreground">
				{fit(label, width)}
			</span>
		</span>
	);
}

function ClipFrame({
	label,
	colorClass,
	selected,
	className,
	children,
}: {
	label: string;
	colorClass: string;
	selected: boolean;
	className: string;
	children: ReactNode;
}) {
	return (
		<div
			role="img"
			aria-label={label}
			className={cn(FRAME, className, colorClass, edge(selected))}
		>
			{children}
			{selected ? <SelectedWash /> : null}
		</div>
	);
}

/** A clip's edge alone, for drawing over the clips it overlaps. */
export function ClipOutline({
	element,
	selected,
}: {
	element: ResolvedElement;
	selected: boolean;
}) {
	return (
		<span
			className={cn(
				"absolute inset-0 rounded-md border",
				ELEMENT_CONFIGS[element.type].colorClass,
				edge(selected),
			)}
		/>
	);
}

/** A control drawn over a clip, at the right of its body below the header. */
export function ClipAction({ children }: { children: ReactNode }) {
	return (
		<div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
			<span className={cn("shrink-0", HEADER_HEIGHT)} />
			<div className="flex flex-1 items-center justify-end px-2 *:pointer-events-auto">
				{children}
			</div>
		</div>
	);
}

export function TimelineClip({
	clip,
	width,
	label,
	selected,
	sceneNumber,
	pxPerSec,
	trim,
}: {
	clip: TimelineClipData;
	width: number;
	label: string;
	selected: boolean;
	/** Set on foreground clips, which are the scenes of the video. */
	sceneNumber?: number;
	pxPerSec: number;
	/** The trim drawn, which leads the element's own while a trim is dragged. */
	trim: Trim;
}) {
	const { element } = clip;
	const config = ELEMENT_CONFIGS[element.type];
	const range = formatTimeRange(clip.start, clip.duration);
	const accessibleLabel = [
		sceneNumber && sceneLabel(sceneNumber),
		config.label,
		element.captions && "captioned",
		range,
	]
		.filter(Boolean)
		.join(", ");

	return (
		<ClipFrame
			label={accessibleLabel}
			colorClass={config.colorClass}
			selected={selected}
			className="timeline-clip-surface"
		>
			<ClipHeader
				icon={config.Icon}
				label={label || config.label}
				width={width}
			/>
			<div className="flex min-h-0 flex-1">
				{config.layer === "audio" ? (
					<Preview>
						<ClipWaveform
							src={element.url}
							width={element.mediaDurationSec * pxPerSec}
							offset={trim.trimStartSec * pxPerSec}
						/>
					</Preview>
				) : (
					<Preview>
						<Footage
							outputKind={config.outputKind}
							src={urlAt(element.url, element.trimStartSec)}
						/>
					</Preview>
				)}
			</div>
			{sceneNumber ? (
				<CornerChip className="font-numeric">
					<span className="truncate">
						{fit(sceneLabel(sceneNumber), width)}
					</span>
				</CornerChip>
			) : null}
		</ClipFrame>
	);
}

/** Where a scene runs on past its video, drawn apart from the clip and never trimmed. */
export function TimelineExtension({
	element,
	start,
	duration,
	clipWidth,
	width,
	selected,
}: {
	element: ResolvedElement;
	start: number;
	duration: number;
	/** How wide the footage before it is drawn, so loop passes match it. */
	clipWidth: number;
	width: number;
	selected: boolean;
}) {
	const { url, loop, trimStartSec, trimDurationSec } = element;
	const config = ELEMENT_CONFIGS[element.type];
	const face = LOOP_FACES[loop ? "on" : "off"];
	return (
		<ClipFrame
			label={`${face.label}, ${formatTimeRange(start, duration)}`}
			colorClass={config.colorClass}
			selected={selected}
			className="timeline-preview-surface border-dashed"
		>
			<ClipHeader icon={face.icon} label={face.label} width={width} />
			<div className="flex min-h-0 flex-1 opacity-60">
				{loop ? (
					Array.from({ length: Math.ceil(width / clipWidth) }, (_, i) => (
						<Preview key={i} width={clipWidth}>
							<Footage
								outputKind={config.outputKind}
								src={urlAt(url, trimStartSec)}
							/>
						</Preview>
					))
				) : (
					<Preview>
						<Footage
							outputKind={config.outputKind}
							src={urlAt(url, trimStartSec + trimDurationSec)}
						/>
					</Preview>
				)}
			</div>
		</ClipFrame>
	);
}

export function TimelineCaptionClip({
	clip,
	width,
	selected,
}: {
	clip: CaptionClip;
	width: number;
	selected: boolean;
}) {
	const text = lineText(clip.line);
	return (
		<ClipFrame
			label={`Caption, ${formatTimeRange(clip.start, clip.duration)}: ${text}`}
			colorClass={ELEMENT_CONFIGS[clip.element.type].colorClass}
			selected={selected}
			className="timeline-clip-surface justify-center"
		>
			<ClipHeader icon={Captions} label={text} width={width} />
		</ClipFrame>
	);
}
