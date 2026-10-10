"use client";

import { useStore } from "zustand";
import { useAccountStoreHandle } from "./account-store-provider";
import type { AccountContext } from "./account-store";

export function useAccount<T>(selector: (state: AccountContext) => T): T {
	const store = useAccountStoreHandle();
	return useStore(store, selector);
}
