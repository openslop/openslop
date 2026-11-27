"use client";

import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { useProjectId } from "@/lib/project/project-provider";
import { useProjectCostUsd } from "@/lib/project/project-cost";
import { UsdAmount } from "./usd-amount";

export function ProjectCostBadge({
	children,
	...props
}: ComponentProps<typeof Badge>) {
	return (
		<Badge variant="subtle" {...props}>
			<Tag />
			{children}
			<UsdAmount usd={useProjectCostUsd(useProjectId())} />
		</Badge>
	);
}

export function ToolbarProjectCost() {
	return (
		<SimpleTooltip label="What this project has spent so far" side="bottom">
			<ProjectCostBadge variant="muted" size="lg">
				<span className="sr-only">Project cost</span>
			</ProjectCostBadge>
		</SimpleTooltip>
	);
}
