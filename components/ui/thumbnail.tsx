import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** The footprint every asset tile shares: a square face over a one-line caption. */
function Thumbnail({
	className,
	asChild = false,
	fill = false,
	...props
}: React.ComponentProps<"div"> & { asChild?: boolean; fill?: boolean }) {
	const Comp = asChild ? Slot.Root : "div";
	return (
		<Comp
			data-slot="thumbnail"
			className={cn("flex flex-col gap-1", !fill && "w-16 sm:w-20", className)}
			{...props}
		/>
	);
}

const thumbnailFaceVariants = cva(
	"relative flex aspect-square items-center justify-center overflow-hidden rounded-md border text-muted-foreground",
	{
		variants: {
			look: {
				card: "border-border bg-card",
				muted: "border-border bg-muted",
				dashed:
					"border-dashed border-border bg-muted transition-colors hover:text-foreground",
			},
			selected: { true: "border-accent ring-2 ring-accent" },
		},
		defaultVariants: { look: "card" },
	},
);

function ThumbnailFace({
	className,
	look,
	selected,
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof thumbnailFaceVariants>) {
	return (
		<div
			data-slot="thumbnail-face"
			className={cn(thumbnailFaceVariants({ look, selected }), className)}
			{...props}
		/>
	);
}

function ThumbnailCaption({
	icon,
	className,
	children,
	...props
}: React.ComponentProps<"span"> & { icon?: React.ReactNode }) {
	return (
		<span
			data-slot="thumbnail-caption"
			className={cn(
				"flex items-center justify-center gap-1 text-badge text-muted-foreground",
				className,
			)}
			{...props}
		>
			{icon}
			<span className="truncate">{children}</span>
		</span>
	);
}

export { Thumbnail, ThumbnailCaption, ThumbnailFace };
