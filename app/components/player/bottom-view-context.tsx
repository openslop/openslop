"use client";

import { useMemo, useState, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/create-required-context";
import type { BottomView } from "./bottom-views";

const [BottomViewContext, useBottomView] = createRequiredContext<{
	view: BottomView;
	setView: (view: BottomView) => void;
}>("BottomViewContext");
export { useBottomView };

export function BottomViewProvider({ children }: { children: ReactNode }) {
	const [view, setView] = useState<BottomView>("timeline");
	const value = useMemo(() => ({ view, setView }), [view]);
	return <BottomViewContext value={value}>{children}</BottomViewContext>;
}
