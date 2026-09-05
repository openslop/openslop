import { NextResponse } from "next/server";
import { z } from "zod";
import { providerKeyCheck, saveProviderKey } from "@/lib/api/providerKeys";
import { MIN_KEY_LENGTH } from "@/lib/connectors/providerKey";
import { verifyProviderKey } from "@/lib/api/providers/byok";
import { byokProviderField } from "@/lib/api/request-schema-fields";
import { createSessionRouteHandler } from "@/lib/api/route-handler";

const saveSchema = z.object({
	provider: byokProviderField,
	apiKey: z
		.string()
		.min(MIN_KEY_LENGTH, { message: "That key looks too short." }),
});

/**
 * Stores the key, then says whether it works. The key is kept either way: a
 * probe that cannot reach the provider is not evidence the key is wrong, and
 * losing it would be the worse failure.
 */
export const POST = createSessionRouteHandler({
	schema: saveSchema,
	label: "Provider key save",
	handle: async ({ user, input }) => {
		const { provider, apiKey } = input;
		await saveProviderKey(user.id, provider, apiKey);
		const validation = await verifyProviderKey(user.id, provider, apiKey);
		return NextResponse.json(await providerKeyCheck(user, validation));
	},
});
