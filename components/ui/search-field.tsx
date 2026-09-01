import type { ComponentProps } from "react";
import { Search } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * A field that filters what sits below it. The magnifier is the label, so the
 * placeholder is free to say what can be searched rather than repeat "search".
 */
export function SearchField({ className, ...props }: ComponentProps<"input">) {
	return (
		<div
			className={cn(
				"flex h-9 items-center gap-2 rounded-md border border-border bg-input px-2.5 transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50",
				className,
			)}
		>
			<Search className="size-4 shrink-0 text-muted-foreground" />
			<input
				type="search"
				className="h-full w-full min-w-0 bg-transparent font-body text-label text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
				{...props}
			/>
		</div>
	);
}
