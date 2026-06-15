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

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-header"
			className={cn("flex items-center justify-between gap-2", className)}
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-title"
			className={cn("text-sm font-semibold", className)}
			{...props}
		/>
	);
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-description"
			className={cn("text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-content"
			className={cn("min-w-0", className)}
			{...props}
		/>
	);
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-footer"
			className={cn("flex items-center gap-2", className)}
			{...props}
		/>
	);
}

export {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
};
