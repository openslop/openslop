import { type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/** Glass-chrome dropdown surface; pass sizing/z-index/scroll classes per use. */
export function GlassDropdownContent({
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
	return (
		<DropdownMenuContent
			className={cn(
				"rounded-xl border border-glass-border bg-glass-fill backdrop-blur-xl shadow-md shadow-black/8 p-0.5",
				className,
			)}
			{...props}
		/>
	);
}

/**
 * Menu item for glass dropdowns. Passing `selected` (even false) reserves a
 * leading check column so option labels stay aligned across the menu.
 */
export function GlassDropdownItem({
	selected,
	className,
	children,
	...props
}: React.ComponentProps<typeof DropdownMenuItem> & { selected?: boolean }) {
	return (
		<DropdownMenuItem
			className={cn(
				"cursor-pointer rounded-full px-2 py-1 text-[11px] text-white/70 hover:text-white focus:text-white focus:bg-white/10",
				className,
			)}
			{...props}
		>
			{selected !== undefined && (
				<span className="w-3.5 shrink-0 flex items-center justify-center">
					{selected && (
						<Check className="w-3 h-3 text-white" aria-hidden="true" />
					)}
				</span>
			)}
			{children}
		</DropdownMenuItem>
	);
}

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
					className={`inline-flex items-center gap-1 bg-white/15 text-white text-[12px] px-2 py-0.5 rounded-full hover:bg-white/25 transition-colors ${className ?? ""}`}
				>
					{triggerIcon ?? selected?.icon}
					{selected?.label}
					<ChevronDown className="w-2.5 h-2.5 text-white/70" />
				</button>
			</DropdownMenuTrigger>
			<GlassDropdownContent side={side} align={align} className="min-w-32">
				{options.map((option) => (
					<GlassDropdownItem
						key={option.value}
						selected={option.value === value}
						onSelect={() => onChange(option.value)}
					>
						{option.icon}
						{option.label}
					</GlassDropdownItem>
				))}
			</GlassDropdownContent>
		</DropdownMenu>
	);
}
