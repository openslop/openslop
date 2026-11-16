"use client";

import type { GeneratedElement } from "@/lib/canvas/types";
import { elementSchema } from "@/lib/canvas/element-connector";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { SectionTitle } from "@/components/ui/section-title";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { SlidersHorizontal } from "@/components/ui/icon";
import { AttributeBadge } from "./attribute-badge";
import { HeaderIconButton } from "./header-icon-button";

export function ElementSettings({ element }: { element: GeneratedElement }) {
	const defs = elementSchema(element).settingsDefs;
	if (defs.length === 0) return null;
	return (
		<Popover>
			<SimpleTooltip label="Settings">
				<PopoverTrigger asChild>
					<HeaderIconButton ariaLabel="Settings">
						<SlidersHorizontal />
					</HeaderIconButton>
				</PopoverTrigger>
			</SimpleTooltip>
			<PopoverContent align="start" className="w-64">
				<SectionTitle className="mb-2">Settings</SectionTitle>
				<div className="flex flex-col gap-2">
					{defs.map((def) => (
						<div
							key={def.key}
							className="flex items-center justify-between gap-3"
						>
							<span className="shrink-0 text-label">{def.label}</span>
							<AttributeBadge element={element} def={def} />
						</div>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
