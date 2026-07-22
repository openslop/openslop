"use client";

import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import { PlayerShimmer } from "./PlayerShimmer";
import styles from "./QueueProgressBar.module.css";

export function QueueProgressBar() {
	const active = useQueueSelector((q) => q.getActiveCount());
	const done = useQueueSelector((q) => q.getGeneratedCount());
	const total = active + done;
	const pct = total === 0 ? 0 : (done / total) * 100;

	return (
		<PlayerShimmer>
			<div className="flex w-2/3 max-w-md flex-col items-center gap-2">
				<div
					className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={total || 1}
					aria-valuenow={done}
					aria-label="Generation progress"
				>
					<div className={styles.fill} style={{ width: `${pct}%` }} />
				</div>
				<div className="font-body text-label text-muted-foreground tabular-nums">
					{total === 0 ? "Preparing…" : `${done} of ${total} generated`}
				</div>
			</div>
		</PlayerShimmer>
	);
}
