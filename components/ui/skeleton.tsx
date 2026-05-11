import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={cn("shimmer-surface rounded-md", className)}
			{...props}
		/>
	);
}

export { Skeleton };
