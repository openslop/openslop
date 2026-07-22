function floorSeconds(seconds: number): number {
	return Math.floor(Math.max(0, seconds));
}

export function formatTime(seconds: number): string {
	const total = floorSeconds(seconds);
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatTimeRange(start: number, duration: number): string {
	return `${formatTime(start)}–${formatTime(start + duration)}`;
}

// Derive the badge from the same floored endpoints the start–end range shows,
// so the two can never disagree (#426). Rounding the raw length instead diverges
// from the floored range whenever start/duration are non-integer.
export function formatRangeDuration(start: number, duration: number): string {
	return `${floorSeconds(start + duration) - floorSeconds(start)}s`;
}
