import { type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface GlassDropdownOption<T extends string> {
	value: T;
	label: string;
	icon?: ReactNode;
}

export default function GlassDropdown<T extends string>({
	value,
	onChange,
	options,
	ariaLabel,
	side = "bottom",
	align = "start",
	className,
}: {
	value: T;
	onChange: (value: T) => void;
	options: GlassDropdownOption<T>[];
	ariaLabel?: string;
	side?: "top" | "bottom";
	align?: "start" | "center" | "end";
	className?: string;
}) {
	const selected = options.find((o) => o.value === value);

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<button
					aria-label={ariaLabel}
					className={`inline-flex items-center gap-1 bg-white/15 text-white text-[12px] px-2 py-0.5 rounded-full hover:bg-white/25 transition-colors ${className ?? ""}`}
				>
					{selected?.icon}
					{selected?.label}
					<ChevronDown className="w-2.5 h-2.5 text-white/70" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				side={side}
				align={align}
				className="min-w-32 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-md shadow-black/8 p-0.5"
			>
				{options.map((option) => (
					<DropdownMenuItem
						key={option.value}
						onClick={() => onChange(option.value)}
						className="cursor-pointer rounded-full px-2 py-1 text-[11px] text-white/70 hover:text-white focus:text-white focus:bg-white/10"
					>
						{option.value === value && (
							<Check className="w-3 h-3 mr-0.5 text-white" aria-hidden="true" />
						)}
						{option.icon}
						{option.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
