"use client";

import { Fragment } from "react";
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
				<div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2">
					{defs.map((def) => (
						<Fragment key={def.key}>
							<span className="text-label">{def.label}</span>
							<div className="flex justify-end">
								<AttributeBadge element={element} def={def} />
							</div>
						</Fragment>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
