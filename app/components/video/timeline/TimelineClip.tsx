import type { IconComponent } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { MediaWithSkeleton } from "@/app/components/canvas/elements/MediaWithSkeleton";
import { ELEMENT_CONFIGS } from "@/lib/canvas/elementConfigs";
import { truncateMiddle } from "@/lib/format";
import { formatTimeRange } from "@/lib/video/timestamps";
import { cn } from "@/lib/utils";
import { ClipWaveform } from "./ClipWaveform";
import type { TimelineClip as TimelineClipData } from "./timelineRows";

const HEADER_ICON_SIZE = 9;
const TOOLTIP_MAX_CHARS = 180;
const PX_PER_CHAR = 6;
const MIN_CHARS = 4;

const FRAME =
	"relative flex h-full w-full flex-col overflow-hidden rounded-md border";
const SELECTED_EDGE = "border-current/60";
const PREVIEW = "m-0.5 min-h-0 flex-1 overflow-hidden rounded-sm";

const fit = (text: string, width: number) =>
	truncateMiddle(text, Math.max(MIN_CHARS, Math.floor(width / PX_PER_CHAR)));

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
			<SimpleTooltip
				label={
					<span dir="auto" className="block max-w-xs text-pretty">
						{truncateMiddle(label, TOOLTIP_MAX_CHARS)}
					</span>
				}
			>
				<span dir="auto" className="truncate text-badge-xs text-foreground">
					{fit(label, width)}
				</span>
			</SimpleTooltip>
		</span>
	);
}

export function TimelineClip({
	clip,
	width,
	label,
	selected,
	sceneNumber,
}: {
	clip: TimelineClipData;
	width: number;
	label: string;
	selected: boolean;
	/** Set on foreground clips, which are the scenes of the video. */
	sceneNumber?: number;
}) {
	const { element } = clip;
	const config = ELEMENT_CONFIGS[element.type];
	const range = formatTimeRange(clip.start, clip.duration);
	const accessibleLabel = sceneNumber
		? `Scene ${sceneNumber}, ${config.label}, ${range}`
		: `${config.label}, ${range}`;

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
			<div className={cn(PREVIEW, "timeline-preview-surface")}>
				{config.layer === "visual" ? (
					<div className="relative aspect-square h-full overflow-hidden">
						<MediaWithSkeleton
							outputKind={config.outputKind}
							src={element.url}
							alt=""
						/>
					</div>
				) : (
					<ClipWaveform src={element.url} width={width} className="h-full" />
				)}
			</div>
			{sceneNumber ? (
				<span className="absolute bottom-0.5 left-0.5 max-w-full truncate rounded-tr-sm rounded-bl-sm bg-on-media/65 px-1 font-mono text-badge-xs text-on-media-foreground">
					{fit(`Scene ${sceneNumber}`, width)}
				</span>
			) : null}
			{selected ? <SelectedWash /> : null}
		</div>
	);
}
