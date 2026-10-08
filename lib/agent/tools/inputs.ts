export const atLeastOne = (what: string) =>
	[
		(input: object) => Object.keys(input).length > 0,
		{ message: `name at least one ${what} to change` },
	] as const;
