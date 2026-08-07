/**
 * Whole seconds elapsed for each running job, reported once a second. The
 * interval only exists while something is running.
 */
export class ElapsedTicker {
	private starts = new Map<string, number>();
	private timer: ReturnType<typeof setInterval> | null = null;

	constructor(private readonly onTick: (elapsed: [string, number][]) => void) {}

	start(id: string) {
		this.starts.set(id, Date.now());
		this.timer ??= setInterval(() => {
			const now = Date.now();
			this.onTick(
				Array.from(this.starts, ([startedId, start]) => [
					startedId,
					((now - start) / 1000) | 0,
				]),
			);
		}, 1000);
	}

	stop(id: string) {
		this.starts.delete(id);
		if (this.timer && this.starts.size === 0) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}
}
