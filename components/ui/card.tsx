import * as React from "react";

import { cn } from "@/lib/utils";

function Card({
	className,
	glow = false,
	...props
}: React.ComponentProps<"div"> & { glow?: boolean }) {
	return (
		<div
			data-slot="card"
			className={cn(
				"relative flex flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-elevation-3",
				glow && "overflow-hidden",
				className,
			)}
			{...props}
		>
			{glow && (
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 -z-10"
					style={{
						backgroundImage:
							"radial-gradient(70% 55% at 50% 0%, var(--glow), transparent 70%)",
					}}
				/>
			)}
			{props.children}
		</div>
	);
}

export { Card };
