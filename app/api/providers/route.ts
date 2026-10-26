import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/api/logger";
import {
	providerKeyCheck,
	saveProviderKey,
	setKeyStatus,
} from "@/lib/api/provider-keys";
import {
	PROVIDER_CATALOG,
	type BYOKProvider,
} from "@/lib/connectors/provider-catalog";
import {
	MIN_KEY_LENGTH,
	type ValidationResult,
} from "@/lib/connectors/provider-key";
import { validateKey } from "@/lib/api/providers/byok";
import { byokProviderField } from "@/lib/api/request-schema-fields";
import { createSessionRouteHandler } from "@/lib/api/route-handler";

const saveSchema = z.object({
	provider: byokProviderField,
	apiKey: z
		.string()
		.min(MIN_KEY_LENGTH, { message: "That key looks too short." }),
});

const unchecked = (
	provider: BYOKProvider,
	cause: unknown,
): ValidationResult => {
	const { name } = PROVIDER_CATALOG[provider];
	logger.warn(cause, `${name} key check gave no answer`);
	return {
		ok: false,
		error: `Saved, but ${name} gave no answer when the key was checked. Test it later.`,
	};
};

/** Only the vendor's silence is forgiven: a vault failure still fails the save. */
const checkStoredKey = async (
	userId: string,
	provider: BYOKProvider,
	apiKey: string,
): Promise<ValidationResult> => {
	let result: ValidationResult;
	try {
		result = await validateKey(provider, apiKey);
	} catch (cause) {
		return unchecked(provider, cause);
	}
	await setKeyStatus(userId, provider, result.ok ? "valid" : "invalid");
	return result;
};

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
		const validation = await checkStoredKey(user.id, provider, apiKey);
		return NextResponse.json(await providerKeyCheck(user, validation));
	},
});
