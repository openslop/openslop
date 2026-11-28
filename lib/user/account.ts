import { z } from "zod";
import { connectorModelsSchema } from "@/lib/connectors/models";

export const AccountSchema = z
	.object({
		id: z.string(),
		email: z.string(),
		user_metadata: z.object({
			full_name: z.string().optional(),
			avatar_url: z.string().optional(),
			/** Whatever the account last saved, ignored if it is not a model map. */
			models: connectorModelsSchema.catch({}),
		}),
	})
	.transform(({ id, email, user_metadata }) => ({
		id,
		email,
		name: user_metadata.full_name ?? email.split("@")[0],
		avatarUrl: user_metadata.avatar_url,
		models: user_metadata.models,
	}));

export type Account = z.infer<typeof AccountSchema>;
