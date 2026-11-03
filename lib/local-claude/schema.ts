import { z } from "zod";

export const ClaudeAccountSchema = z.object({
	installed: z.boolean(),
	connected: z.boolean(),
	email: z.string().optional(),
	subscription: z.string().optional(),
});
