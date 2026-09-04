"use client";

import { type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { connectorModelsSchema } from "@/lib/connectors/models";
import type { ProviderKeyRecord } from "@/lib/connectors/providerKey";
import { AccountStoreProvider } from "./AccountStoreProvider";

const [UserContext, useUser] = createRequiredContext<User>("UserProvider");
export { useUser };

/** Whatever the account last saved, ignored if it is not a model map. */
const accountModelsSchema = connectorModelsSchema.catch({});

export function UserProvider({
	user,
	providerKeys,
	children,
}: {
	user: User;
	/** Read on the server beside the user, so the pickers never open on a guess. */
	providerKeys: ProviderKeyRecord[];
	children: ReactNode;
}) {
	return (
		<UserContext value={user}>
			<AccountStoreProvider
				account={{
					models: accountModelsSchema.parse(user.user_metadata?.models),
					providerKeys,
				}}
			>
				{children}
			</AccountStoreProvider>
		</UserContext>
	);
}
