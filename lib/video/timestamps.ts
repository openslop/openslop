export function formatTime(seconds: number): string {
	const safe = Math.max(0, seconds);
	const m = Math.floor(safe / 60);
	const s = Math.floor(safe % 60);
	return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatTimeRange(start: number, duration: number): string {
	return `${formatTime(start)}–${formatTime(start + duration)}`;
}

export function formatDuration(seconds: number): string {
	return `${Math.round(Math.max(0, seconds))}s`;
}
