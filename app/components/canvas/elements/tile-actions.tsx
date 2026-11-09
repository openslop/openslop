"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { ICON_SIZES } from "@/components/ui/icon-button";
import {
	PushIn,
	Maximize2,
	Pencil,
	Play,
	Stop,
	Trash2,
	X,
	type IconComponent,
} from "@/components/ui/icon";
import { keepFocus } from "@/components/ui/keep-focus";
import { Toolbar, ToolbarButton } from "@/components/ui/toolbar";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { truncateMiddle } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MediaViewerDialog, type Viewed } from "./media-viewer";

const SPOTS = {
	/** Centered along the top once the tile (`@container/tile`) is wide enough to give it room. */
	top: "top-1 left-1 @[6rem]/tile:left-1/2 @[6rem]/tile:-translate-x-1/2",
	center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
} as const;

// Touch has no hover, so there the pill always shows.
const REVEAL_ON_HOVER =
	"opacity-0 group-hover/tile:opacity-100 focus-within:opacity-100 has-[[aria-expanded=true]]:opacity-100 pointer-coarse:opacity-100";

/** The panel's toggle pill over a tile's face (`group/tile`), shown on hover or while `shown`. */
function TileChip({
	spot,
	label,
	shown = false,
	children,
}: {
	spot: keyof typeof SPOTS;
	label: string;
	shown?: boolean;
	children: ReactNode;
}) {
	return (
		<Toolbar
			variant="tile"
			aria-label={label}
			className={cn(
				"absolute z-10 transition-opacity empty:hidden",
				SPOTS[spot],
				!shown && REVEAL_ON_HOVER,
			)}
		>
			{children}
		</Toolbar>
	);
}

/** Every action on a tile, in one pill along its top edge. */
export function TileActions({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	return (
		<TileChip spot="top" label={`${label} actions`}>
			{children}
		</TileChip>
	);
}

/** A file name short enough for a tooltip; the accessible label keeps it whole. */
export const shortName = (name: string) => truncateMiddle(name, 24);

/** One action in a tile's pill; dialogs and menus take it as their trigger. */
export function TileAction({
	label,
	tooltip = label,
	icon: Icon,
	...props
}: ComponentProps<typeof ToolbarButton> & {
	label: string;
	tooltip?: string;
	icon: IconComponent;
}) {
	return (
		<SimpleTooltip label={tooltip}>
			<ToolbarButton aria-label={label} onMouseDown={keepFocus} {...props}>
				<Icon size={ICON_SIZES.header} />
			</ToolbarButton>
		</SimpleTooltip>
	);
}

export function ViewLargerAction(viewed: Viewed) {
	return (
		<MediaViewerDialog {...viewed}>
			<TileAction
				label={`View ${viewed.name} larger`}
				tooltip={`View ${shortName(viewed.name)} larger`}
				icon={Maximize2}
			/>
		</MediaViewerDialog>
	);
}

type NamedAction = { name: string; onClick: () => void };

export function EditAction({ name, onClick }: NamedAction) {
	return (
		<TileAction
			label={`Edit ${name}`}
			tooltip={`Edit ${shortName(name)}`}
			icon={Pencil}
			onClick={onClick}
		/>
	);
}

/** The push-in arrow flipped, rising into the frame: what made a take comes back in. */
const LoadIn: IconComponent = ({ className, ...props }) => (
	<PushIn className={cn("-scale-y-100", className)} {...props} />
);

const reuseLabels = (name: string) => ({
	label: `Load the prompt and settings of ${name}`,
	tooltip: `Load the prompt and settings of ${shortName(name)}`,
});

/** Loads what made a take back into the playground, like restoring a version. */
export function ReuseAction({ name, onClick }: NamedAction) {
	return <TileAction {...reuseLabels(name)} icon={LoadIn} onClick={onClick} />;
}

/** Takes it off this list; the media itself stays. */
export function RemoveAction({ name, onClick }: NamedAction) {
	return (
		<TileAction
			label={`Remove ${name}`}
			tooltip={`Remove ${shortName(name)}`}
			icon={X}
			onClick={onClick}
		/>
	);
}

/** Takes it out of the project for good. */
export function DeleteAction({ name, onClick }: NamedAction) {
	return (
		<TileAction
			label={`Delete ${name}`}
			tooltip={`Delete ${shortName(name)}`}
			icon={Trash2}
			onClick={onClick}
			tone="destructive"
		/>
	);
}

/** Plays a tile's video in place with no controls, back to its still when stopped or done. */
export function TilePlayer({ src, name }: { src: string; name: string }) {
	const [playing, setPlaying] = useState(false);
	const stop = () => setPlaying(false);
	return (
		<>
			{playing && (
				<video
					src={src}
					autoPlay
					onEnded={stop}
					onError={stop}
					className="pointer-events-none absolute inset-0 size-full object-cover"
				/>
			)}
			<TileChip spot="center" label={`${name} playback`} shown={playing}>
				<TileAction
					label={`${playing ? "Stop" : "Play"} ${name}`}
					tooltip={`${playing ? "Stop" : "Play"} ${shortName(name)}`}
					icon={playing ? Stop : Play}
					onClick={() => setPlaying(!playing)}
				/>
			</TileChip>
		</>
	);
}
