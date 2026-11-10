import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** The footprint every asset tile shares: a 16:9 face over a one-line caption, as wide as its grid's cell. */
function Thumbnail({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot.Root : "div";
	return (
		<Comp
			data-slot="thumbnail"
			className={cn(
				"flex w-[var(--thumbnail-width,8rem)] flex-col gap-1",
				className,
			)}
			{...props}
		/>
	);
}

const thumbnailFaceVariants = cva(
	"relative flex aspect-video items-center justify-center overflow-hidden rounded-md border text-muted-foreground",
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

const thumbnailGridVariants = cva("grid gap-2 [--thumbnail-width:100%]", {
	variants: {
		columns: {
			1: "grid-cols-1",
			2: "grid-cols-2",
			3: "grid-cols-3",
			4: "grid-cols-4",
		},
	},
});

/** A popover's width, holding two thumbnails a row in a `columns={2}` grid. */
const THUMBNAIL_POPOVER_WIDTH = "w-72";

/** Thumbnails sharing a surface's width, `columns` to a row. */
function ThumbnailGrid({
	className,
	columns,
	...props
}: React.ComponentProps<"div"> &
	Required<VariantProps<typeof thumbnailGridVariants>>) {
	return (
		<div
			data-slot="thumbnail-grid"
			className={cn(thumbnailGridVariants({ columns }), className)}
			{...props}
		/>
	);
}

export {
	Thumbnail,
	ThumbnailCaption,
	ThumbnailFace,
	ThumbnailGrid,
	THUMBNAIL_POPOVER_WIDTH,
};
