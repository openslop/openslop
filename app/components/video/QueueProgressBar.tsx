"use client";

import { useSyncExternalStore } from "react";
import { generationQueue } from "@/lib/generation/queue";
import { PlayerShimmer } from "./PlayerShimmer";
import styles from "./QueueProgressBar.module.css";

export function QueueProgressBar() {
	const active = useSyncExternalStore(
		generationQueue.subscribe,
		generationQueue.getActiveCount,
		() => 0,
	);
	const peak = useSyncExternalStore(
		generationQueue.subscribe,
		generationQueue.getPeakActive,
		() => 0,
	);
	const done = peak - active;
	const pct = peak === 0 ? 0 : (done / peak) * 100;

	return (
		<PlayerShimmer>
			<div className="flex w-2/3 max-w-md flex-col items-center gap-2">
				<div
					className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={peak || 1}
					aria-valuenow={done}
					aria-label="Generation progress"
				>
					<div className={styles.fill} style={{ width: `${pct}%` }} />
				</div>
				<div className="text-xs text-white/60 tabular-nums">
					{peak === 0 ? "Preparing…" : `${done} of ${peak} generated`}
				</div>
			</div>
		</PlayerShimmer>
	);
}
