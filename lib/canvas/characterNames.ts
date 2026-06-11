/**
 * Parse the comma-separated `characters` element attribute into trimmed,
 * non-empty character names. Single source for the format so the delimiter and
 * trimming can't drift between call sites.
 */
export function parseCharacterNames(value: string | undefined): string[] {
	return (value ?? "")
		.split(",")
		.map((name) => name.trim())
		.filter(Boolean);
}
