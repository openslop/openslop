import { NextResponse } from "next/server";
import { z } from "zod";
import {
	connectorsView,
	deleteConnector,
	MissingConnectorKeyError,
	readConnectorKey,
} from "@/lib/api/connectorKeys";
import { verifyConnector } from "@/lib/api/providers";
import { byokProviderField } from "@/lib/api/request-schema-fields";
import { createSessionParamRouteHandler } from "@/lib/api/route-handler";

const paramsSchema = z.object({ provider: byokProviderField });

/** Re-checks the stored key against the provider and records what it found. */
export const POST = createSessionParamRouteHandler({
	schema: paramsSchema,
	label: "Connector test",
	handle: async ({ user, params }) => {
		const key = await readConnectorKey(user.id, params.provider);
		if (!key) throw new MissingConnectorKeyError(params.provider);
		const validation = await verifyConnector(user.id, params.provider, key);
		return NextResponse.json(await connectorsView(user.id, validation));
	},
});

export const DELETE = createSessionParamRouteHandler({
	schema: paramsSchema,
	label: "Connector removal",
	handle: async ({ user, params }) => {
		await deleteConnector(user.id, params.provider);
		return NextResponse.json(await connectorsView(user.id));
	},
});
