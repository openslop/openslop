import { z } from "zod";

/** Failures the client handles itself rather than only showing. */
export const ApiErrorCode = z.enum(["stale_deployment"]);
export type ApiErrorCode = z.infer<typeof ApiErrorCode>;

/** The body every internal route answers a failure with. */
export const ApiErrorEnvelope = z.object({
	error: z.string().min(1),
	code: ApiErrorCode.optional(),
});
export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelope>;
