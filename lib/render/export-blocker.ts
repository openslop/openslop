export function exportBlocker({
	sloppyBusy,
	hasContent,
	generating,
}: {
	sloppyBusy: boolean;
	hasContent: boolean;
	generating: boolean;
}): string | null {
	if (sloppyBusy) return "Wait for Sloppy to finish";
	if (!hasContent) return "Generate at least one element first";
	if (generating) return "Wait for generation to finish";
	return null;
}
