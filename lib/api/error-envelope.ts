import { z } from "zod";

/** The body every internal route answers a failure with. */
export const ApiErrorEnvelope = z.object({
	error: z.string().min(1),
	/** Present on unexpected 500s: quote it to match the server log line. */
	requestId: z.string().min(1).optional(),
});
export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelope>;
