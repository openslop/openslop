import type { IconComponent } from "@/components/ui/icon";
import { MediaWithSkeleton } from "@/lib/components/media-with-skeleton";
import { ELEMENT_CONFIGS } from "@/app/components/canvas/elements/element-configs";
import { sceneLabel } from "@/lib/canvas/constants";
import { truncateMiddle } from "@/lib/format";
import { isTrimmable, playedSec, type Trim } from "@/lib/render/clip-trim";
import { formatTimeRange } from "@/lib/render/timestamps";
import type { ResolvedElement } from "@/lib/render/types";
import { cn } from "@/lib/utils";
import { ClipWaveform } from "./clip-waveform";
import type { TimelineClip as TimelineClipData } from "./timeline-rows";

const HEADER_ICON_SIZE = 9;
const PX_PER_CHAR = 6;
const MIN_CHARS = 4;
const ROUNDING_SLACK_PX = 1;

const FRAME =
	"relative flex h-full w-full flex-col overflow-hidden rounded-md border";
const SELECTED_EDGE = "border-current/60";

const fit = (text: string, width: number) =>
	truncateMiddle(text, Math.max(MIN_CHARS, Math.floor(width / PX_PER_CHAR)));

type PreviewBox = { src: string; width?: number };

const urlAt = (url: string, sec: number) => (sec > 0 ? `${url}#t=${sec}` : url);

function visualPreviews(
	element: Pick<
		ResolvedElement,
		"url" | "loop" | "trimStartSec" | "mediaDurationSec"
	>,
	playedWidth: number,
	width: number,
): PreviewBox[] {
	const { url, loop, trimStartSec, mediaDurationSec } = element;
	const inPoint = urlAt(url, trimStartSec);
	if (!isTrimmable(element) || playedWidth >= width - ROUNDING_SLACK_PX)
		return [{ src: inPoint }];
	const playthrough = { src: inPoint, width: playedWidth };
	if (!loop) return [playthrough, { src: urlAt(url, mediaDurationSec) }];
	return Array.from(
		{ length: Math.ceil(width / playedWidth) },
		() => playthrough,
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
		<span className="relative z-10 flex h-3.5 shrink-0 items-center gap-1 px-1">
			<Icon size={HEADER_ICON_SIZE} className="shrink-0" />
			<span dir="auto" className="truncate text-badge-xs text-foreground">
				{fit(label, width)}
			</span>
		</span>
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
		range,
	]
		.filter(Boolean)
		.join(", ");

	return (
		<div
			role="img"
			aria-label={accessibleLabel}
			className={cn(
				FRAME,
				"timeline-clip-surface",
				config.colorClass,
				selected ? SELECTED_EDGE : "border-border",
			)}
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
					visualPreviews(
						element,
						playedSec({ ...element, ...trim }) * pxPerSec,
						width,
					).map((box, i) => (
						<Preview key={i} width={box.width}>
							<div className="relative aspect-square h-full overflow-hidden">
								<MediaWithSkeleton
									outputKind={config.outputKind}
									src={box.src}
									alt=""
								/>
							</div>
						</Preview>
					))
				)}
			</div>
			{sceneNumber ? (
				<span className="absolute bottom-0.5 left-0.5 max-w-full truncate rounded-tr-sm rounded-bl-sm bg-on-media/65 px-1 font-numeric text-badge-xs text-on-media-foreground">
					{fit(sceneLabel(sceneNumber), width)}
				</span>
			) : null}
			{selected ? <SelectedWash /> : null}
		</div>
	);
}
