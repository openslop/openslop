"use client";

import {
	Children,
	Fragment,
	isValidElement,
	useState,
	type ComponentProps,
	type ReactNode,
} from "react";
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
import { toastError } from "@/lib/toast-error";
import { cn } from "@/lib/utils";
import { MediaViewerDialog, type Viewed } from "./media-viewer";

// Touch has no hover, so there the controls always show.
const REVEAL_ON_HOVER =
	"opacity-0 group-hover/tile:opacity-100 focus-within:opacity-100 has-aria-expanded:opacity-100 pointer-coarse:opacity-100";

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

/** Whether `node` holds anything to show, looking inside fragments; an element counts even if it renders nothing. */
function hasItems(node: ReactNode): boolean {
	return Children.toArray(node).some((child) =>
		isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
			? hasItems(child.props.children)
			: true,
	);
}

/** A tile's other actions, behind the ⋮ on its toolbar in the top-right corner; no ⋮ when there are none. */
export function TileMenu({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	if (!hasItems(children)) return null;
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

/** Remove and Delete, on their own toolbar in the tile's top-left corner; nothing when the tile offers neither. */
export function TileRemoveActions({
	name,
	onRemove,
	removeFrom,
	onDelete,
}: {
	name: string;
	onRemove?: () => void;
	/** What Remove takes the tile off, when its label should say. */
	removeFrom?: string;
	onDelete?: () => void;
}) {
	if (!onRemove && !onDelete) return null;
	const from = removeFrom ? ` from ${removeFrom}` : "";
	return (
		<Toolbar
			variant="tile"
			className={cn(
				"absolute top-1 left-1 z-10 transition-opacity",
				REVEAL_ON_HOVER,
			)}
		>
			{onRemove && (
				<TileToolbarButton
					label={`Remove ${name}${from}`}
					tooltip={`Remove${from}`}
					onClick={onRemove}
				>
					<X size={ICON_SIZES.header} />
				</TileToolbarButton>
			)}
			{onDelete && (
				<TileToolbarButton
					label={`Delete ${name}`}
					tooltip="Delete"
					tone="destructive"
					onClick={onDelete}
				>
					<Trash2 size={ICON_SIZES.header} />
				</TileToolbarButton>
			)}
		</Toolbar>
	);
}

type MenuAction = { onSelect: () => void };

/** Delete as a menu item, for rows too small for the corner button. */
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
				onError={(event) => {
					stop();
					toastError(
						event.currentTarget.error?.message || "the file could not load",
						"Could not play video",
					);
				}}
				className="pointer-events-none absolute inset-0 size-full object-cover"
			/>
		),
	};
}
