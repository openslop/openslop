"use client";

import { type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { AccountStoreProvider } from "./AccountStoreProvider";

const [UserContext, useUser] = createRequiredContext<User>("UserProvider");
export { useUser };

const AccountModelsSchema = z.record(z.string(), z.string()).catch({});

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
				models={AccountModelsSchema.parse(user.user_metadata?.connectorModels)}
			>
				{children}
			</AccountStoreProvider>
		</UserContext>
	);
}
