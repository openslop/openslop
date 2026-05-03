export type GenerationInputs = {
	prompt: string;
	attributes: Record<string, string>;
};

function attributesEqual(
	a: Record<string, string>,
	b: Record<string, string>,
): boolean {
	const keys = Object.keys(a);
	if (keys.length !== Object.keys(b).length) return false;
	for (const k of keys) if (a[k] !== b[k]) return false;
	return true;
}

function inputsEqual(a: GenerationInputs, b: GenerationInputs): boolean {
	return a.prompt === b.prompt && attributesEqual(a.attributes, b.attributes);
}

export function isStaleResult(
	snapshot: { result: unknown; resultInputs: GenerationInputs | null },
	currentInputs: GenerationInputs,
): boolean {
	return (
		snapshot.result !== null &&
		snapshot.resultInputs !== null &&
		!inputsEqual(snapshot.resultInputs, currentInputs)
	);
}

export function serializeInputs(inputs: GenerationInputs): string {
	return JSON.stringify({
		prompt: inputs.prompt,
		attributes: Object.fromEntries(
			Object.entries(inputs.attributes).sort(([a], [b]) => a.localeCompare(b)),
		),
	});
}
