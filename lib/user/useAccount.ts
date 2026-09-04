"use client";

import { useStore } from "zustand";
import { useAccountStoreHandle } from "./AccountStoreProvider";
import type { AccountContext } from "./accountStore";

export function useAccount<T>(selector: (state: AccountContext) => T): T {
	const store = useAccountStoreHandle();
	return useStore(store, selector);
}
