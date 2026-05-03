"use client";

import type { ReactNode } from "react";

export function PlayerShimmer({ children }: { children?: ReactNode }) {
	return (
		<div className="shimmer-surface flex aspect-video w-full items-center justify-center">
			{children}
		</div>
	);
}
