"use client";

import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { useViewMode } from "../ViewModeContext";

export default function ViewModePanel() {
	const { expandAll, collapseAll } = useViewMode();

	const btnClass =
		"flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-white/30 hover:text-white/50 transition-colors";

	return (
		<div className="flex flex-col gap-2">
			<h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">
				Scenes
			</h2>
			<button type="button" onClick={expandAll} className={btnClass}>
				<ChevronsUpDown size={16} strokeWidth={1.5} />
				Expand All
			</button>
			<button type="button" onClick={collapseAll} className={btnClass}>
				<ChevronsDownUp size={16} strokeWidth={1.5} />
				Collapse All
			</button>
		</div>
	);
}
