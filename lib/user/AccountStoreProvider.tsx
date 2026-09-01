"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { toastError } from "@/lib/toastError";
import type { ConnectorModels } from "@/lib/connectors/models";
import { createAccountStore, type AccountStore } from "./accountStore";

const [AccountStoreContext, useAccountStoreHandle] =
	createRequiredContext<AccountStore>("AccountStoreProvider");
export { useAccountStoreHandle };

export function AccountStoreProvider({
	models,
	children,
}: {
	models: ConnectorModels;
	children: ReactNode;
}) {
	const [store] = useState(() => createAccountStore(models));

	// Stored keys decide what the model pickers offer, so they are read once for
	// the session rather than on opening the settings that manage them.
	useEffect(() => {
		store.getState().loadConnectors().catch(toastError);
	}, [store]);

	return <AccountStoreContext value={store}>{children}</AccountStoreContext>;
}
