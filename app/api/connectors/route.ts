import { NextResponse } from "next/server";
import { z } from "zod";
import { connectorsView, saveConnectorKey } from "@/lib/api/connectorKeys";
import { verifyConnector } from "@/lib/api/connectorValidation";
import { byokProviderField } from "@/lib/api/request-schema-fields";
import {
	createSessionQueryRouteHandler,
	createSessionRouteHandler,
} from "@/lib/api/route-handler";

export const GET = createSessionQueryRouteHandler({
	schema: z.object({}),
	label: "Connector list",
	handle: async ({ user }) => NextResponse.json(await connectorsView(user.id)),
});

const saveSchema = z.object({
	provider: byokProviderField,
	apiKey: z.string().min(8, { message: "That key looks too short." }),
});

/**
 * Stores the key, then says whether it works. The key is kept either way: a
 * probe that cannot reach the provider is not evidence the key is wrong, and
 * losing it would be the worse failure.
 */
export const POST = createSessionRouteHandler({
	schema: saveSchema,
	label: "Connector save",
	handle: async ({ user, input }) => {
		const { provider, apiKey } = input;
		await saveConnectorKey(user.id, provider, apiKey);
		const validation = await verifyConnector(user.id, provider, apiKey);
		return NextResponse.json(await connectorsView(user.id, validation));
	},
});
