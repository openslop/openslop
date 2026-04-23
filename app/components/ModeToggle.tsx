import { type ReactNode } from "react";
import { ScrollText, Sparkles } from "lucide-react";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import type { ComposerMode } from "@/lib/config/ConfigProvider";

interface ModeOption {
	value: ComposerMode;
	label: string;
	icon: ReactNode;
	tooltip: string;
}

const MODE_OPTIONS: ModeOption[] = [
	{
		value: "story",
		label: "Prompt Mode",
		icon: <Sparkles className="h-3.5 w-3.5" />,
		tooltip: "Describe your idea, AI writes the script",
	},
	{
		value: "script",
		label: "Script Mode",
		icon: <ScrollText className="h-3.5 w-3.5" />,
		tooltip: "Paste your own script directly",
	},
];

export default function ModeToggle({
	value,
	onChange,
}: {
	value: ComposerMode;
	onChange: (mode: ComposerMode) => void;
}) {
	return (
		<div className="flex items-center gap-1.5">
			{MODE_OPTIONS.map((option) => (
				<Tooltip key={option.value}>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={() => onChange(option.value)}
							className={`font-body flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-violet-400/30 ${
								option.value === value
									? "relative grain border-violet-500/30 bg-[#2d2040]/60 text-violet-300"
									: "border-white/10 bg-transparent text-white/40 hover:border-white/20 hover:text-white/60"
							}`}
						>
							{option.icon}
							{option.label}
						</button>
					</TooltipTrigger>
					<TooltipContent>{option.tooltip}</TooltipContent>
				</Tooltip>
			))}
		</div>
	);
}
