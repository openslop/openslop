"use client";

import { useState } from "react";
import { Palette } from "@/components/ui/icon";
import { Thumbnail, ThumbnailFace } from "@/components/ui/thumbnail";
import { ImageWithShimmer } from "@/lib/components/image-with-shimmer";
import { truncateMiddle } from "@/lib/format";
import { ART_STYLE_PRESETS, type ArtStyle } from "@/lib/project/art-styles";
import { cn } from "@/lib/utils";
import { FieldLabel } from "../character/fields";

/** Three lines of the tile at `text-label`. The full text is in the field above. */
const DESCRIPTION_LENGTH = 84;

function PresetTile({
	preset: { description, thumbnail },
	selected,
	onSelect,
}: {
	preset: ArtStyle;
	selected: boolean;
	onSelect: () => void;
}) {
	const [broken, setBroken] = useState(false);
	return (
		<Thumbnail asChild fill>
			<button
				type="button"
				onClick={onSelect}
				aria-pressed={selected}
				title={description}
				className="focus-ring w-full rounded-md text-left"
			>
				<ThumbnailFace
					look="muted"
					selected={selected}
					className={cn(
						"transition-colors",
						!selected && "hover:border-accent/40",
					)}
				>
					{thumbnail && !broken ? (
						<ImageWithShimmer
							src={thumbnail}
							alt=""
							fill
							sizes="(min-width: 640px) 220px, 50vw"
							className="object-cover"
							onError={() => setBroken(true)}
						/>
					) : (
						<Palette className="h-5 w-5" />
					)}
				</ThumbnailFace>
				<span className="text-label text-muted-foreground">
					{truncateMiddle(description, DESCRIPTION_LENGTH)}
				</span>
			</button>
		</Thumbnail>
	);
}

export function ArtStylePresets({
	value,
	onSelect,
}: {
	value: string;
	onSelect: (description: string) => void;
}) {
	const selected = value.trim();
	return (
		<section aria-label="Presets" className="flex flex-col gap-2">
			<FieldLabel>Presets</FieldLabel>
			<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
				{ART_STYLE_PRESETS.map((preset) => (
					<li key={preset.description}>
						<PresetTile
							preset={preset}
							selected={preset.description === selected}
							onSelect={() => onSelect(preset.description)}
						/>
					</li>
				))}
			</ul>
		</section>
	);
}
