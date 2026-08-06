import { serializeError } from "serialize-error";

/** For logs and transport, where the whole error (name, stack, cause) matters. */
export const stringifyError = (error: unknown): string =>
	JSON.stringify(serializeError(error));

/** For anything a person reads. UI code reaches for `toastError` instead. */
export const errorMessage = (error: unknown): string =>
	error instanceof Error ? error.message : String(error);
