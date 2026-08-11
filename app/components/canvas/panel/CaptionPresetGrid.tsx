"use client";

import { useState } from "react";
import isEqual from "lodash/isEqual";
import {
	CAPTION_PRESETS,
	type CaptionPreset,
} from "@/lib/video/captionPresets";
import type { CaptionStyle } from "@/lib/video/captionStyle";
import { cn } from "@/lib/utils";
import { CaptionStage, useCaptionCycle } from "./CaptionStage";

const SAMPLE = ["Look", "at", "this"];
const WIDTH = 96;
const HEIGHT = 54;
// Thumbnails preview the look, not the framing, so they use a legible fixed
// size rather than the preset's percentage of the frame height.
const FONT_PX = 11;

function PresetCard({
	preset,
	selected,
	onSelect,
}: {
	preset: CaptionPreset;
	selected: boolean;
	onSelect: () => void;
}) {
	const [active, setActive] = useState(false);
	const activeIndex = useCaptionCycle(SAMPLE.length, active);

	return (
		<button
			type="button"
			onClick={onSelect}
			onPointerEnter={() => setActive(true)}
			onPointerLeave={() => setActive(false)}
			onFocus={() => setActive(true)}
			onBlur={() => setActive(false)}
			aria-pressed={selected}
			className={cn(
				"flex flex-col items-center gap-1 rounded-lg p-1 transition-colors focus-ring",
				selected ? "bg-secondary" : "hover:bg-secondary/60",
			)}
		>
			<CaptionStage
				style={preset.style}
				words={SAMPLE}
				activeIndex={activeIndex}
				width={WIDTH}
				height={HEIGHT}
				fontSizePx={FONT_PX}
				maxWordsPerLine={SAMPLE.length}
			/>
			<span className="text-label-xs text-panel-label">{preset.label}</span>
		</button>
	);
}

export function CaptionPresetGrid({
	style,
	onSelect,
}: {
	style: CaptionStyle;
	onSelect: (style: CaptionStyle) => void;
}) {
	return (
		<div className="grid grid-cols-2 gap-1">
			{CAPTION_PRESETS.map((preset) => (
				<PresetCard
					key={preset.key}
					preset={preset}
					selected={isEqual(style, preset.style)}
					onSelect={() => onSelect(preset.style)}
				/>
			))}
		</div>
	);
}
