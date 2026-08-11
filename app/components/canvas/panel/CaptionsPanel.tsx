"use client";

import {
	AlignBottom,
	AlignCenter,
	AlignLeft,
	AlignMiddle,
	AlignRight,
	AlignTop,
	Eye,
	EyeOff,
	TextSize,
} from "@/components/ui/icon";
import {
	MediaToggle,
	type MediaToggleOption,
} from "@/components/ui/media-toggle";
import { NumberScrubber } from "@/components/ui/number-scrubber";
import { useProject } from "@/lib/project/useProject";
import {
	CAPTION_RANGES,
	type CaptionAlignX,
	type CaptionAlignY,
	type CaptionCasing,
	type CaptionReveal,
} from "@/lib/video/captionStyle";
import { useCaptionsEnabled } from "@/lib/video/useCaptionsEnabled";
import { useCaptionStyle } from "@/lib/video/useCaptionStyle";
import { CaptionFontField } from "./CaptionFontField";
import { CaptionPresetGrid } from "./CaptionPresetGrid";
import { CaptionPreview } from "./CaptionPreview";
import { CaptionTextStyleFields } from "./CaptionTextStyleFields";
import { PanelCard, PanelField } from "./PanelCard";

const REVEAL_OPTIONS: MediaToggleOption<CaptionReveal>[] = [
	{ value: "line", label: "Whole line at once", text: "Line" },
	{ value: "word", label: "Word by word", text: "Word" },
];

const CASE_OPTIONS: MediaToggleOption<CaptionCasing>[] = [
	{ value: "none", label: "Standard case", text: "Ab" },
	{ value: "upper", label: "Uppercase", text: "AB" },
	{ value: "lower", label: "Lowercase", text: "ab" },
];

const ALIGN_X_OPTIONS: MediaToggleOption<CaptionAlignX>[] = [
	{ value: "left", label: "Align left", icon: AlignLeft },
	{ value: "center", label: "Align center", icon: AlignCenter },
	{ value: "right", label: "Align right", icon: AlignRight },
];

const ALIGN_Y_OPTIONS: MediaToggleOption<CaptionAlignY>[] = [
	{ value: "top", label: "Align top", icon: AlignTop },
	{ value: "middle", label: "Align middle", icon: AlignMiddle },
	{ value: "bottom", label: "Align bottom", icon: AlignBottom },
];

export function CaptionsPanel() {
	const captionsEnabled = useCaptionsEnabled();
	const updateMetadata = useProject((s) => s.updateMetadata);
	const [style, setStyle] = useCaptionStyle();

	return (
		<>
			<PanelCard title="Captions">
				<PanelField label="Show">
					<MediaToggle
						value={captionsEnabled ? "on" : "off"}
						onChange={(value) =>
							updateMetadata({ videoSettings: { captions: value === "on" } })
						}
						options={[
							{ value: "on", label: "Show captions", icon: Eye },
							{ value: "off", label: "Hide captions", icon: EyeOff },
						]}
					/>
				</PanelField>
				{captionsEnabled && <CaptionPreview style={style} />}
			</PanelCard>

			{captionsEnabled && (
				<>
					<PanelCard title="Presets">
						<CaptionPresetGrid style={style} onSelect={setStyle} />
					</PanelCard>

					<PanelCard title="Text">
						<div className="flex items-center gap-2">
							<div className="min-w-0 flex-1">
								<CaptionFontField
									value={style.font}
									onChange={(font) => setStyle({ font })}
								/>
							</div>
							<NumberScrubber
								label="Text size"
								className="h-8"
								icon={TextSize}
								value={style.fontSize}
								suffix="px"
								{...CAPTION_RANGES.fontSize}
								onChange={(fontSize) => setStyle({ fontSize })}
							/>
						</div>
						<PanelField label="Case">
							<MediaToggle
								value={style.casing}
								options={CASE_OPTIONS}
								onChange={(casing) => setStyle({ casing })}
							/>
						</PanelField>
						<PanelField label="Reveal">
							<MediaToggle
								value={style.reveal}
								options={REVEAL_OPTIONS}
								onChange={(reveal) => setStyle({ reveal })}
							/>
						</PanelField>
						<PanelField label="Words per line">
							<NumberScrubber
								label="Words per line"
								tooltip="Maximum words on a caption line"
								value={style.maxWordsPerLine}
								{...CAPTION_RANGES.maxWordsPerLine}
								onChange={(maxWordsPerLine) => setStyle({ maxWordsPerLine })}
							/>
						</PanelField>
					</PanelCard>

					<PanelCard title="Placement">
						<PanelField label="Horizontal">
							<MediaToggle
								value={style.alignX}
								options={ALIGN_X_OPTIONS}
								onChange={(alignX) => setStyle({ alignX })}
							/>
						</PanelField>
						<PanelField label="Vertical">
							<MediaToggle
								value={style.alignY}
								options={ALIGN_Y_OPTIONS}
								onChange={(alignY) => setStyle({ alignY })}
							/>
						</PanelField>
					</PanelCard>

					<PanelCard title="Style">
						<CaptionTextStyleFields
							value={style.base}
							onChange={(base) => setStyle({ base })}
						/>
					</PanelCard>

					<PanelCard title="Active word">
						<CaptionTextStyleFields
							value={style.activeWord}
							onChange={(activeWord) => setStyle({ activeWord })}
						/>
						<PanelField label="Size">
							<NumberScrubber
								label="Active word size"
								tooltip="Active word size, relative to the caption"
								className="h-8"
								icon={TextSize}
								value={style.activeWord.scale}
								suffix="%"
								{...CAPTION_RANGES.activeScale}
								onChange={(scale) =>
									setStyle({ activeWord: { ...style.activeWord, scale } })
								}
							/>
						</PanelField>
					</PanelCard>
				</>
			)}
		</>
	);
}
