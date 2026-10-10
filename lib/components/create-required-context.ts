"use client";

import { createContext, use } from "react";

// undefined is the missing-provider sentinel so contexts may legitimately hold null
export function createRequiredContext<T>(name: string) {
	const Context = createContext<T | undefined>(undefined);
	Context.displayName = name;

	function useRequiredContext(): T {
		const value = use(Context);
		if (value === undefined) {
			throw new Error(`${name} is missing a provider`);
		}
		return value;
	}

	return [Context, useRequiredContext] as const;
}
