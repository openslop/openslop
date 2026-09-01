import { NextResponse, type NextRequest } from "next/server";
import {
	connectorsView,
	deleteConnector,
	MissingConnectorKeyError,
	readConnectorKey,
} from "@/lib/api/connectorKeys";
import { verifyConnector } from "@/lib/api/connectorValidation";
import { byokProviderField } from "@/lib/api/request-schema-fields";
import { notFound } from "@/lib/api/response";
import { withSession } from "@/lib/api/with-auth";

type Context = { params: Promise<{ provider: string }> };

const connectorParam = async (context: Context) =>
	byokProviderField.safeParse((await context.params).provider);

/** Re-checks the stored key against the provider and records what it found. */
export async function POST(_request: NextRequest, context: Context) {
	return withSession("Connector test", async (user) => {
		const parsed = await connectorParam(context);
		if (!parsed.success) return notFound();
		const provider = parsed.data;
		const key = await readConnectorKey(user.id, provider);
		if (!key) throw new MissingConnectorKeyError(provider);
		const validation = await verifyConnector(user.id, provider, key);
		return NextResponse.json(await connectorsView(user.id, validation));
	});
}

export async function DELETE(_request: NextRequest, context: Context) {
	return withSession("Connector removal", async (user) => {
		const parsed = await connectorParam(context);
		if (!parsed.success) return notFound();
		await deleteConnector(user.id, parsed.data);
		return NextResponse.json(await connectorsView(user.id));
	});
}
