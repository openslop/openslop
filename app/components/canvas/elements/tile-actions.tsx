"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Maximize2,
	MoreVertical,
	Play,
	Stop,
	Trash2,
	X,
	type IconComponent,
} from "@/components/ui/icon";
import { ICON_SIZES } from "@/components/ui/icon-button";
import { keepFocus } from "@/components/ui/keep-focus";
import { Toolbar, ToolbarButton } from "@/components/ui/toolbar";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MediaViewerDialog, type Viewed } from "./media-viewer";

// Touch has no hover, so there the controls always show.
const REVEAL_ON_HOVER =
	"opacity-0 group-hover/tile:opacity-100 focus-within:opacity-100 has-[[aria-expanded=true]]:opacity-100 pointer-coarse:opacity-100";

/** What choosing a tile's face (`group/tile`) does. */
export type TilePrimary = {
	label: string;
	icon: IconComponent;
	onSelect: () => void;
};

/** The whole face as one button, under the media scrim on hover with its icon in the middle. */
export function TilePrimaryAction({
	label,
	icon: Icon,
	onSelect,
}: TilePrimary) {
	return (
		<SimpleTooltip label={label}>
			<button
				type="button"
				onClick={onSelect}
				onMouseDown={keepFocus}
				aria-label={label}
				className="focus-ring absolute inset-0 flex items-center justify-center bg-on-media/55 text-on-media-foreground opacity-0 transition group-hover/tile:opacity-100 focus-visible:opacity-100 focus-visible:ring-inset"
			>
				<Icon size={ICON_SIZES.header} />
			</button>
		</SimpleTooltip>
	);
}

/** A tile's other actions, behind the ⋮ on its toolbar in the top-right corner. */
export function TileMenu({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	return (
		<Toolbar
			variant="tile"
			className={cn(
				"absolute top-1 right-1 z-10 transition-opacity",
				REVEAL_ON_HOVER,
			)}
		>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<TileToolbarButton
						label={`More actions for ${label}`}
						tooltip="More actions"
					>
						<MoreVertical size={ICON_SIZES.header} />
					</TileToolbarButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="min-w-40">
					{children}
				</DropdownMenuContent>
			</DropdownMenu>
		</Toolbar>
	);
}

export function TileMenuItem({
	icon: Icon,
	children,
	...props
}: ComponentProps<typeof DropdownMenuItem> & { icon: IconComponent }) {
	return (
		<DropdownMenuItem {...props}>
			<Icon />
			{children}
		</DropdownMenuItem>
	);
}

/** A button on a tile's toolbar, with its tooltip; menus take it as their trigger. */
function TileToolbarButton({
	label,
	tooltip,
	...props
}: ComponentProps<typeof ToolbarButton> & { label: string; tooltip: string }) {
	return (
		<SimpleTooltip label={tooltip}>
			<ToolbarButton aria-label={label} onMouseDown={keepFocus} {...props} />
		</SimpleTooltip>
	);
}

type MenuAction = { onSelect: () => void };

/** Takes it off this list; the media itself stays. */
export const RemoveItem = ({ onSelect }: MenuAction) => (
	<TileMenuItem icon={X} onSelect={onSelect}>
		Remove
	</TileMenuItem>
);

/** Takes it out of the project for good. */
export const DeleteItem = ({ onSelect }: MenuAction) => (
	<TileMenuItem icon={Trash2} variant="destructive" onSelect={onSelect}>
		Delete
	</TileMenuItem>
);

/** The large view of `viewed`: its menu item, and the dialog that outlives the menu closing. */
export function useViewLarger(viewed: Viewed | undefined) {
	const [open, setOpen] = useState(false);
	const show = () => setOpen(true);
	return viewed
		? {
				show,
				item: (
					<TileMenuItem icon={Maximize2} onSelect={show}>
						View larger
					</TileMenuItem>
				),
				dialog: (
					<MediaViewerDialog {...viewed} open={open} onOpenChange={setOpen} />
				),
			}
		: { show, item: null, dialog: null };
}

/** Plays a tile's video in place with no controls, back to its still when stopped or done; the face plays and stops it. */
export function useTilePlayer(src: string | undefined, name: string) {
	const [playing, setPlaying] = useState(false);
	if (!src) return { primary: undefined, video: null };
	const stop = () => setPlaying(false);
	const primary: TilePrimary = {
		label: `${playing ? "Stop" : "Play"} ${name}`,
		icon: playing ? Stop : Play,
		onSelect: () => setPlaying((was) => !was),
	};
	return {
		primary,
		video: playing && (
			<video
				src={src}
				autoPlay
				onEnded={stop}
				onError={stop}
				className="pointer-events-none absolute inset-0 size-full object-cover"
			/>
		),
	};
}
