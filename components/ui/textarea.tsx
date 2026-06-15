import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"flex min-h-20 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground shadow-xs transition-colors outline-none placeholder:text-muted-foreground hover:border-ring/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
