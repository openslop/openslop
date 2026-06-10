"use client";

import { useState, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";

type PeaksCache = Map<string, number[]>;

const [PreviewCacheContext, usePreviewCache] =
	createRequiredContext<PeaksCache>("PreviewCacheContext");
export { usePreviewCache };

export function PreviewCacheProvider({ children }: { children: ReactNode }) {
	const [cache] = useState(() => new Map<string, number[]>());
	return <PreviewCacheContext value={cache}>{children}</PreviewCacheContext>;
}
