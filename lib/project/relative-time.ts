export function relativeTime(iso: string): string {
	const elapsedMs = Date.now() - new Date(iso).getTime();
	const minutes = Math.floor(elapsedMs / 60_000);
	if (minutes < 1) return "now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;
	return new Date(iso).toLocaleDateString("en-US", { timeZone: "UTC" });
}
