"use client";

import { useMemo, useState, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";

/** Which view occupies the strip under the transport bar. */
export type BottomView = "timeline" | "storyboard" | "hidden";

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
