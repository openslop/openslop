// Next only inlines NEXT_PUBLIC_ variables written out in full, so callers pass the value
export function requiredEnv(name: string, value: string | undefined): string {
	if (!value) throw new Error(`${name} is required`);
	return value;
}
