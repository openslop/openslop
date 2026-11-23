"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/icon";
import { formatCost } from "@/lib/format";

export function CostBadge({
	costUsd,
	size,
	children,
}: {
	costUsd: number | undefined;
	size: "xsLabel" | "inlineXs";
	children: ReactNode;
}) {
	if (costUsd === undefined) return null;
	return (
		<Badge variant="subtle" size={size}>
			<Tag />
			{children}
			<span>{formatCost(costUsd)}</span>
		</Badge>
	);
}
