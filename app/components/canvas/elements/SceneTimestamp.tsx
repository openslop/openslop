import { formatRangeDuration, formatTimeRange } from "@/lib/video/timestamps";

export function SceneTimestamp({
	start,
	duration,
}: {
	start: number;
	duration: number;
}) {
	return (
		<span className="ml-1.5 flex items-center gap-2 font-normal font-numeric">
			<span className="text-muted-foreground">
				{formatTimeRange(start, duration)}
			</span>
			<span className="rounded bg-muted px-1.5 py-px text-muted-foreground">
				{formatRangeDuration(start, duration)}
			</span>
		</span>
	);
}
