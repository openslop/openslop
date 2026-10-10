import { z } from "zod";

/** The body every internal route answers a failure with. */
export const ApiErrorEnvelope = z.object({ error: z.string().min(1) });
export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelope>;
