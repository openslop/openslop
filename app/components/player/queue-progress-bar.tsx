"use client";

import { Progress } from "@/components/ui/progress";
import { useQueueSelector } from "@/lib/generation/generation-queue-provider";
import { PlayerShimmer } from "./player-shimmer";

export function QueueProgressBar() {
	const active = useQueueSelector((q) => q.getActiveCount());
	const inFlight = useQueueSelector((q) => q.getGeneratingCount());
	const done = useQueueSelector((q) => q.getGeneratedCount());
	const total = active + done;
	// `done` includes results reseeded on reload, so only an active job means progress.
	const generating = active > 0;

	return (
		<PlayerShimmer>
			<div className="flex w-2/3 max-w-md flex-col items-center gap-2">
				<Progress
					value={generating ? (done / total) * 100 : null}
					aria-label="Generation progress"
				/>
				<div className="text-label text-muted-foreground">
					{generating
						? `Generating ${inFlight} of ${total} elements`
						: "Preparing…"}
				</div>
			</div>
		</PlayerShimmer>
	);
}
