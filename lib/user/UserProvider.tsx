"use client";

import { createContext, use, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

const UserContext = createContext<User | null>(null);

export function useUser() {
	const ctx = use(UserContext);
	if (!ctx) throw new Error("useUser must be used within UserProvider");
	return ctx;
}

export function UserProvider({
	user,
	children,
}: {
	user: User;
	children: ReactNode;
}) {
	return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
