import type { ComponentProps } from "react";
import { Search } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchField({
	className,
	...props
}: ComponentProps<typeof Input>) {
	return (
		<div className="relative">
			<Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="search"
				className={cn(
					"pr-2.5 pl-8.5 text-label [&::-webkit-search-cancel-button]:hidden",
					className,
				)}
				{...props}
			/>
		</div>
	);
}
