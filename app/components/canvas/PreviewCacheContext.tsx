"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type PeaksCache = Map<string, number[]>;

const PreviewCacheContext = createContext<PeaksCache>(new Map());

export function PreviewCacheProvider({ children }: { children: ReactNode }) {
	const [cache] = useState(() => new Map<string, number[]>());
	return <PreviewCacheContext value={cache}>{children}</PreviewCacheContext>;
}

export function usePreviewCache() {
	return useContext(PreviewCacheContext);
}
