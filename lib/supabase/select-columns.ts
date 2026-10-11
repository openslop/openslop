import type { z } from "zod";

/** The select list for a row schema, so a query cannot drift from what it parses. */
export const selectColumns = (schema: z.ZodObject): string =>
	Object.keys(schema.shape).join(", ");
