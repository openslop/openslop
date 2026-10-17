import { Badge } from "@/components/ui/badge";
import { formatRangeDuration, formatTimeRange } from "@/lib/render/timestamps";

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
			<Badge variant="muted" size="inline">
				{formatRangeDuration(start, duration)}
			</Badge>
		</span>
	);
}
