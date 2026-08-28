/**
 * Shortens from the middle, for text whose head and tail both identify it: an
 * art style opens with its medium and closes with its palette, so cutting the
 * end would drop half of what tells two styles apart.
 */
export function truncateMiddle(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	const kept = maxLength - 1;
	const headLength = Math.ceil(kept / 2);
	const head = text.slice(0, headLength);
	const tail = text.slice(text.length - (kept - headLength));
	// Both sides fall back to the raw cut, so unbroken text still shortens.
	const headBreak = head.lastIndexOf(" ");
	const tailBreak = tail.indexOf(" ");
	return [
		(headBreak > 0 ? head.slice(0, headBreak) : head).trimEnd(),
		tailBreak >= 0 ? tail.slice(tailBreak) : tail,
	].join("…");
}

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	const kb = bytes / 1024;
	if (kb < 1024) return `${kb.toFixed(1)} KB`;
	const mb = kb / 1024;
	if (mb < 1024) return `${mb.toFixed(1)} MB`;
	return `${(mb / 1024).toFixed(1)} GB`;
}

const DATE_TIME = new Intl.DateTimeFormat(undefined, {
	month: "short",
	day: "numeric",
	hour: "numeric",
	minute: "2-digit",
});

export function formatDateTime(iso: string): string {
	return DATE_TIME.format(new Date(iso));
}
