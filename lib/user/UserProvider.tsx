"use client";

import { type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createRequiredContext } from "@/lib/components/createRequiredContext";

const [UserContext, useUser] = createRequiredContext<User>("UserProvider");
export { useUser };

export function UserProvider({
	user,
	children,
}: {
	user: User;
	children: ReactNode;
}) {
	return <UserContext value={user}>{children}</UserContext>;
}
