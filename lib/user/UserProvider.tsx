"use client";

import { type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { connectorModelsSchema } from "@/lib/connectors/models";
import { AccountStoreProvider } from "./AccountStoreProvider";

const [UserContext, useUser] = createRequiredContext<User>("UserProvider");
export { useUser };

/** Whatever the account last saved, ignored if it is not a model map. */
const accountModelsSchema = connectorModelsSchema.catch({});

export function UserProvider({
	user,
	children,
}: {
	user: User;
	children: ReactNode;
}) {
	return (
		<UserContext value={user}>
			<AccountStoreProvider
				models={accountModelsSchema.parse(user.user_metadata?.models)}
				hosted={Boolean(user.app_metadata?.api_access)}
			>
				{children}
			</AccountStoreProvider>
		</UserContext>
	);
}
