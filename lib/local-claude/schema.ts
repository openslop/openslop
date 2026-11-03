import { z } from "zod";

export const ClaudeAccountSchema = z.object({
	installed: z.boolean(),
	loginUrl: z.url().optional(),
	loginError: z.string().optional(),
	connected: z.boolean(),
	email: z.string().optional(),
	subscription: z.string().optional(),
});
