/** For anything a person reads. UI code reaches for `toastError` instead. */
export const errorMessage = (error: unknown): string =>
	error instanceof Error ? error.message : String(error);
