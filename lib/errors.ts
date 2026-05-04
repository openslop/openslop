import { serializeError } from "serialize-error";

export const stringifyError = (error: unknown): string =>
	JSON.stringify(serializeError(error));

export const errorMessage = (error: unknown): string =>
	error instanceof Error ? error.message : String(error);
