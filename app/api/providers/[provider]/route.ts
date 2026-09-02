import { NextResponse } from "next/server";
import { z } from "zod";
import {
	providerKeysView,
	deleteProviderKey,
	MissingProviderKeyError,
	readProviderKey,
} from "@/lib/api/providerKeys";
import { verifyProviderKey } from "@/lib/api/providers/byok";
import { byokProviderField } from "@/lib/api/request-schema-fields";
import { createSessionParamRouteHandler } from "@/lib/api/route-handler";

const paramsSchema = z.object({ provider: byokProviderField });

export const POST = createSessionParamRouteHandler({
	schema: paramsSchema,
	label: "Provider key test",
	handle: async ({ user, params }) => {
		const key = await readProviderKey(user.id, params.provider);
		if (!key) throw new MissingProviderKeyError(params.provider);
		const validation = await verifyProviderKey(user.id, params.provider, key);
		return NextResponse.json(await providerKeysView(user.id, validation));
	},
});

export const DELETE = createSessionParamRouteHandler({
	schema: paramsSchema,
	label: "Provider key removal",
	handle: async ({ user, params }) => {
		await deleteProviderKey(user.id, params.provider);
		return NextResponse.json(await providerKeysView(user.id));
	},
});
