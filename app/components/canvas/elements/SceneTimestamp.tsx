import { formatDuration, formatTimeRange } from "@/lib/video/timestamps";

export function SceneTimestamp({
	start,
	duration,
}: {
	start: number;
	duration: number;
}) {
	return (
		<span className="ml-1.5 flex items-center gap-2 font-normal tabular-nums">
			<span className="text-white/30">{formatTimeRange(start, duration)}</span>
			<span className="rounded bg-white/[0.05] px-1.5 py-px text-white/45">
				{formatDuration(duration)}
			</span>
		</span>
	);
}
