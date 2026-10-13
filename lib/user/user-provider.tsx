"use client";

import { type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/create-required-context";
import type { ProviderKeyRecord } from "@/lib/connectors/provider-key";
import type { Account } from "./account";
import { AccountStoreProvider } from "./account-store-provider";

export type User = Omit<Account, "models">;

const [UserContext, useUser] = createRequiredContext<User>("UserProvider");
export { useUser };

export function UserProvider({
	account,
	providerKeys,
	children,
}: {
	account: Account;
	/** Read on the server beside the user, so the pickers never open on a guess. */
	providerKeys: ProviderKeyRecord[];
	children: ReactNode;
}) {
	const { models, ...user } = account;
	return (
		<UserContext value={user}>
			<AccountStoreProvider account={{ models, providerKeys }}>
				{children}
			</AccountStoreProvider>
		</UserContext>
	);
}
