export type GenerationInputs = {
	prompt: string;
	attributes: Record<string, string>;
};

export function serializeInputs(inputs: GenerationInputs): string {
	return JSON.stringify({
		prompt: inputs.prompt,
		attributes: Object.fromEntries(
			Object.entries(inputs.attributes).sort(([a], [b]) => a.localeCompare(b)),
		),
	});
}
