"use client";

import { useMemo, useState, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";

type AutoScroll = {
	enabled: boolean;
	setEnabled: (v: boolean) => void;
};

const [AutoScrollContext, useAutoScroll] =
	createRequiredContext<AutoScroll>("AutoScrollContext");
export { useAutoScroll };

export function AutoScrollProvider({ children }: { children: ReactNode }) {
	const [enabled, setEnabled] = useState(true);
	const value = useMemo(() => ({ enabled, setEnabled }), [enabled]);
	return <AutoScrollContext value={value}>{children}</AutoScrollContext>;
}
