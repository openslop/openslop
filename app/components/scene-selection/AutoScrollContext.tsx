"use client";

import { createContext, use, useMemo, useState, type ReactNode } from "react";

type AutoScroll = {
	enabled: boolean;
	setEnabled: (v: boolean) => void;
};

const Ctx = createContext<AutoScroll>({
	enabled: true,
	setEnabled: () => {},
});

export function AutoScrollProvider({ children }: { children: ReactNode }) {
	const [enabled, setEnabled] = useState(true);
	const value = useMemo(() => ({ enabled, setEnabled }), [enabled]);
	return <Ctx value={value}>{children}</Ctx>;
}

export function useAutoScroll() {
	return use(Ctx);
}
