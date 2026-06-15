import { type ReactNode } from "react";
import { Check, ChevronDown } from "@/components/ui/icon";
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
	triggerIcon,
	side = "bottom",
	align = "start",
	className,
	style,
}: {
	value: T;
	onChange: (value: T) => void;
	options: GlassDropdownOption<T>[];
	ariaLabel?: string;
	triggerIcon?: ReactNode;
	side?: "top" | "bottom";
	align?: "start" | "center" | "end";
	className?: string;
	style?: React.CSSProperties;
}) {
	const selected = options.find((o) => o.value === value);

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<button
					aria-label={ariaLabel}
					style={style}
					className={`inline-flex items-center gap-1 bg-muted text-foreground text-[12px] px-2 py-0.5 rounded-full hover:bg-muted transition-colors ${className ?? ""}`}
				>
					{triggerIcon ?? selected?.icon}
					{selected?.label}
					<ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				side={side}
				align={align}
				className="min-w-32 rounded-xl border border-border bg-card shadow-md shadow-black/8 p-0.5"
			>
				{options.map((option) => (
					<DropdownMenuItem
						key={option.value}
						onClick={() => onChange(option.value)}
						className="cursor-pointer rounded-full px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground focus:text-foreground focus:bg-muted"
					>
						<span className="w-3.5 shrink-0 flex items-center justify-center">
							{option.value === value && (
								<Check className="w-3 h-3 text-foreground" aria-hidden="true" />
							)}
						</span>
						{option.icon}
						{option.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
