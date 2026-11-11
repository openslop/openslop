import type { ReactNode } from "react";
import { MEDIA_KINDS } from "./media-kinds";
import { ThumbnailCaption } from "@/components/ui/thumbnail";
import { TileMenu } from "./tile-actions";

/** An audio asset a row wide: its name over what it plays, with the ⋮ of a tile's actions. */
export function AudioCard({
	name,
	menu,
	children,
}: {
	name: string;
	menu?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="group/tile @container/tile relative flex flex-col gap-1">
			<ThumbnailCaption
				title={name}
				icon={<MEDIA_KINDS.audio.Icon size={10} />}
				className="justify-start text-panel-label"
			>
				{name}
			</ThumbnailCaption>
			<div className="flex min-h-7 flex-wrap items-center gap-x-2 gap-y-1 [--waveform-height:1.25rem]">
				{children}
			</div>
			{menu && <TileMenu label={name}>{menu}</TileMenu>}
		</div>
	);
}
