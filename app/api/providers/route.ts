import { NextResponse } from "next/server";
import { z } from "zod";
import {
	providerKeyCheck,
	saveProviderKey,
	setKeyStatus,
} from "@/lib/api/provider-keys";
import { MIN_KEY_LENGTH } from "@/lib/connectors/provider-key";
import { validateKey } from "@/lib/api/providers/byok";
import { byokProviderField } from "@/lib/api/request-schema-fields";
import { createSessionRouteHandler } from "@/lib/api/route-handler";

const saveSchema = z.object({
	provider: byokProviderField,
	apiKey: z
		.string()
		.min(MIN_KEY_LENGTH, { message: "That key looks too short." }),
});

/** Stores the key only once the provider has taken it. */
export const POST = createSessionRouteHandler({
	schema: saveSchema,
	label: "Provider key save",
	handle: async ({ user, input }) => {
		const { provider, apiKey } = input;
		const validation = await validateKey(provider, apiKey);
		if (validation.ok) {
			await saveProviderKey(user.id, provider, apiKey);
			await setKeyStatus(user.id, provider, "valid");
		}
		return NextResponse.json(await providerKeyCheck(user, validation));
	},
});
