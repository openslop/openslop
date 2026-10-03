export const named = (what: string) => ({
	message: `name at least one ${what} to change`,
});
export const notEmpty = (input: object) => Object.keys(input).length > 0;
