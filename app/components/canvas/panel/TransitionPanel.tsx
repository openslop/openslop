"use client";

import { ChevronDown } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	GlassDropdownContent,
	GlassDropdownItem,
} from "@/app/components/GlassDropdown";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getProjectStore } from "@/lib/project/store";
import { TRANSITION_TYPES, type TransitionType } from "@/lib/video/transitions";
import { useTransitionType } from "@/lib/video/useTransitionType";

const LABELS: Record<TransitionType, string> = {
	none: "None",
	fade: "Fade",
	slide: "Slide",
	wipe: "Wipe",
	flip: "Flip",
	clockWipe: "Clock Wipe",
	iris: "Iris",
};

export default function TransitionPanel() {
	const { projectId } = useConfig();
	const transitionType = useTransitionType();

	const setTransitionType = (value: TransitionType) =>
		getProjectStore(projectId)
			.getState()
			.updateMetadata({ videoSettings: { transitionType: value } });

	return (
		<div className="flex flex-col gap-2">
			<h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">
				Transition
			</h2>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						aria-label={`Transition: ${LABELS[transitionType]}`}
						className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-white/70 hover:text-white bg-glass-fill hover:bg-white/10 ring-1 ring-inset ring-white/10 hover:ring-white/20 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					>
						<span className="truncate">{LABELS[transitionType]}</span>
						<ChevronDown
							className="w-3.5 h-3.5 shrink-0 text-white/50"
							aria-hidden="true"
						/>
					</button>
				</DropdownMenuTrigger>
				<GlassDropdownContent
					align="start"
					className="z-[90] min-w-[--radix-dropdown-menu-trigger-width] max-h-64 overflow-y-auto"
				>
					{TRANSITION_TYPES.map((value) => (
						<GlassDropdownItem
							key={value}
							selected={value === transitionType}
							onSelect={() => setTransitionType(value)}
							className="rounded-md text-xs"
						>
							{LABELS[value]}
						</GlassDropdownItem>
					))}
				</GlassDropdownContent>
			</DropdownMenu>
		</div>
	);
}
