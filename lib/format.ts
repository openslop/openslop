const BYTE_UNITS = ["KB", "MB", "GB"] as const;

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	let value = bytes / 1024;
	let unit = 0;
	// Promote on the rounded value so a size that rounds up to 1024.0 rolls over
	// to the next unit (e.g. 1023.99 KB → "1.0 MB", not "1024.0 KB").
	while (unit < BYTE_UNITS.length - 1 && Math.round(value * 10) / 10 >= 1024) {
		value /= 1024;
		unit += 1;
	}
	return `${value.toFixed(1)} ${BYTE_UNITS[unit]}`;
}
