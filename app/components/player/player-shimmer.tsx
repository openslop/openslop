"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function PlayerShimmer({ children }: { children?: ReactNode }) {
	return (
		<Skeleton className="flex h-full w-full items-center justify-center">
			{children}
		</Skeleton>
	);
}
