import { formatTime } from "@/lib/render/timestamps";

const TICK_STEPS = [
	0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600,
];

const MIN_LABEL_GAP_PX = 72;
const DOT_GAP_PX = 20;

/** The finest interval whose labels still clear {@link MIN_LABEL_GAP_PX}. */
export function tickInterval(pxPerSec: number): number {
	const fits = TICK_STEPS.find((step) => step * pxPerSec >= MIN_LABEL_GAP_PX);
	return fits ?? TICK_STEPS[TICK_STEPS.length - 1];
}

export function buildTicks(totalDurationSec: number, interval: number) {
	const stepHundredths = Math.round(interval * 100);
	const count =
		Math.floor(Math.round(totalDurationSec * 100) / stepHundredths) + 1;
	return Array.from({ length: count }, (_, i) => (i * stepHundredths) / 100);
}

export function tickLabel(seconds: number, interval: number): string {
	const decimals = Math.max(0, Math.ceil(-Math.log10(interval)));
	if (decimals === 0) return formatTime(seconds);
	return formatTime(seconds) + (seconds % 1).toFixed(decimals).slice(1);
}

export function subdivision(intervalPx: number): number {
	return intervalPx / Math.max(2, Math.round(intervalPx / DOT_GAP_PX));
}
