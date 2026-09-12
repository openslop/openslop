"use client";

import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import { PlayerShimmer } from "./PlayerShimmer";
import styles from "./QueueProgressBar.module.css";

export function QueueProgressBar() {
	const active = useQueueSelector((q) => q.getActiveCount());
	const done = useQueueSelector((q) => q.getGeneratedCount());
	const total = active + done;
	// A reloaded project seeds its finished results back into the queue, so `done`
	// is nonzero before anything runs; only report progress while generating.
	const generating = active > 0;
	const pct = generating ? (done / total) * 100 : 0;

	return (
		<PlayerShimmer>
			<div className="flex w-2/3 max-w-md flex-col items-center gap-2">
				<div
					className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={total || 1}
					aria-valuenow={generating ? done : 0}
					aria-label="Generation progress"
				>
					<div className={styles.fill} style={{ width: `${pct}%` }} />
				</div>
				<div className="text-label text-muted-foreground">
					{generating ? `${done} of ${total} generated` : "Preparing…"}
				</div>
			</div>
		</PlayerShimmer>
	);
}
