"use client";

import { Check, X } from "lucide-react";
import { useAutoScroll } from "@/app/components/scene-selection/AutoScrollContext";

export default function AutoScrollPanel() {
	const { enabled, setEnabled } = useAutoScroll();
	const activeClass =
		"relative grain bg-[#2d2040]/60 border border-violet-500/30 text-violet-300";
	return (
		<div className="flex flex-col gap-2">
			<h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">
				Follow Current Scene
			</h2>
			<button
				type="button"
				onClick={() => setEnabled(true)}
				className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
					enabled ? activeClass : "text-white/30 hover:text-white/50"
				}`}
			>
				<Check size={16} strokeWidth={1.5} />
				On
			</button>
			<button
				type="button"
				onClick={() => setEnabled(false)}
				className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
					!enabled ? activeClass : "text-white/30 hover:text-white/50"
				}`}
			>
				<X size={16} strokeWidth={1.5} />
				Off
			</button>
		</div>
	);
}
