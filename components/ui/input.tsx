import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"flex h-9 w-full min-w-0 rounded-md border border-border bg-input px-3 py-1 text-sm text-foreground shadow-xs transition-colors outline-none placeholder:text-muted-foreground hover:border-ring/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
