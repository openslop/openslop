"use client";

import { useState, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import {
	createAccountStore,
	type AccountData,
	type AccountStore,
} from "./accountStore";

const [AccountStoreContext, useAccountStoreHandle] =
	createRequiredContext<AccountStore>("AccountStoreProvider");
export { useAccountStoreHandle };

export function AccountStoreProvider({
	account,
	children,
}: {
	account: AccountData;
	children: ReactNode;
}) {
	const [store] = useState(() => createAccountStore(account));
	return <AccountStoreContext value={store}>{children}</AccountStoreContext>;
}
