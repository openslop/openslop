const TICK_STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600];

const MIN_LABEL_GAP_PX = 72;
const DOT_GAP_PX = 20;

/** The finest interval whose labels still clear {@link MIN_LABEL_GAP_PX}. */
export function tickInterval(pxPerSec: number): number {
	const fits = TICK_STEPS.find((step) => step * pxPerSec >= MIN_LABEL_GAP_PX);
	return fits ?? TICK_STEPS[TICK_STEPS.length - 1];
}

export function buildTicks(totalDurationSec: number, interval: number) {
	const count = Math.floor(totalDurationSec / interval) + 1;
	return Array.from({ length: count }, (_, i) => i * interval);
}

export function subdivision(intervalPx: number): number {
	return intervalPx / Math.max(2, Math.round(intervalPx / DOT_GAP_PX));
}
