function floorSeconds(seconds: number): number {
	return Math.floor(Math.max(0, seconds));
}

export function formatTime(seconds: number): string {
	const total = floorSeconds(seconds);
	const minutes = Math.floor(total / 60);
	return `${minutes}:${String(total % 60).padStart(2, "0")}`;
}

export function formatTimeRange(start: number, duration: number): string {
	return `${formatTime(start)}–${formatTime(start + duration)}`;
}

// Derive the badge from the same floored endpoints the start–end range shows,
// so the two can never disagree when start/duration are non-integer.
export function formatRangeDuration(start: number, duration: number): string {
	return `${floorSeconds(start + duration) - floorSeconds(start)}s`;
}
