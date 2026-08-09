"use client";

import { useState } from "react";
import { Palette } from "@/components/ui/icon";
import { ImageWithShimmer } from "@/lib/components/ImageWithShimmer";
import { truncateMiddle } from "@/lib/format";
import { ART_STYLE_PRESETS, type ArtStyle } from "@/lib/project/artStyles";
import { cn } from "@/lib/utils";

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
		<button
			type="button"
			onClick={onSelect}
			aria-pressed={selected}
			title={description}
			className="focus-ring flex w-full flex-col gap-1 rounded-md text-left"
		>
			<div
				className={cn(
					"relative flex aspect-square items-center justify-center overflow-hidden rounded-md border bg-muted text-muted-foreground transition-colors",
					selected
						? "border-accent ring-2 ring-accent"
						: "border-border hover:border-accent/40",
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
			</div>
			<span className="text-label text-muted-foreground">
				{truncateMiddle(description, DESCRIPTION_LENGTH)}
			</span>
		</button>
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
		<section
			aria-labelledby="art-style-presets"
			className="flex flex-col gap-2"
		>
			<h3
				id="art-style-presets"
				className="text-label-xs uppercase tracking-wide text-muted-foreground"
			>
				Presets
			</h3>
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
