"use client";

import { Eye, EyeOff } from "@/components/ui/icon";
import { MediaToggle } from "@/components/ui/media-toggle";
import {
	SelectField,
	type SelectFieldOption,
} from "@/components/ui/select-field";
import { useProject } from "@/lib/project/useProject";
import {
	CAPTION_CASINGS,
	CAPTION_FONTS,
	CAPTION_POSITIONS,
	CAPTION_RANGES,
	CAPTION_REVEALS,
	type CaptionCasing,
	type CaptionFont,
	type CaptionPosition,
	type CaptionReveal,
} from "@/lib/video/captionStyle";
import { useCaptionsEnabled } from "@/lib/video/useCaptionsEnabled";
import { useCaptionStyle } from "@/lib/video/useCaptionStyle";
import { CaptionPresetGrid } from "./CaptionPresetGrid";
import { CaptionPreview } from "./CaptionPreview";
import { CaptionTextStyleFields } from "./CaptionTextStyleFields";
import { PanelCard, PanelField, PanelSlider } from "./PanelCard";

const options = <T extends string>(
	values: readonly T[],
	labels: Record<T, string>,
): SelectFieldOption<T>[] =>
	values.map((value) => ({ value, label: labels[value] }));

const FONT_OPTIONS = options<CaptionFont>(CAPTION_FONTS, {
	sans: "Sans",
	condensed: "Condensed",
	serif: "Serif",
	mono: "Mono",
	rounded: "Rounded",
});

const CASING_OPTIONS = options<CaptionCasing>(CAPTION_CASINGS, {
	none: "As spoken",
	upper: "UPPERCASE",
	lower: "lowercase",
});

const POSITION_OPTIONS = options<CaptionPosition>(CAPTION_POSITIONS, {
	top: "Top",
	middle: "Middle",
	bottom: "Bottom",
});

const REVEAL_OPTIONS = options<CaptionReveal>(CAPTION_REVEALS, {
	line: "Whole line",
	word: "Word by word",
});

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
						<PanelField label="Font">
							<SelectField
								value={style.font}
								options={FONT_OPTIONS}
								onChange={(font) => setStyle({ font })}
								ariaLabel="Caption font"
							/>
						</PanelField>
						<PanelField label="Case">
							<SelectField
								value={style.casing}
								options={CASING_OPTIONS}
								onChange={(casing) => setStyle({ casing })}
								ariaLabel="Caption case"
							/>
						</PanelField>
						<PanelField label="Position">
							<SelectField
								value={style.position}
								options={POSITION_OPTIONS}
								onChange={(position) => setStyle({ position })}
								ariaLabel="Caption position"
							/>
						</PanelField>
						<PanelField label="Reveal">
							<SelectField
								value={style.reveal}
								options={REVEAL_OPTIONS}
								onChange={(reveal) => setStyle({ reveal })}
								ariaLabel="Caption reveal"
							/>
						</PanelField>
						<PanelSlider
							label="Size"
							value={style.fontSize}
							{...CAPTION_RANGES.fontSize}
							format={(value) => `${value}%`}
							onChange={(fontSize) => setStyle({ fontSize })}
						/>
						<PanelSlider
							label="Words/line"
							value={style.maxWordsPerLine}
							{...CAPTION_RANGES.maxWordsPerLine}
							onChange={(maxWordsPerLine) => setStyle({ maxWordsPerLine })}
						/>
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
						<PanelSlider
							label="Size"
							value={style.activeWord.scale}
							{...CAPTION_RANGES.activeScale}
							format={(value) => `${value}%`}
							onChange={(scale) =>
								setStyle({ activeWord: { ...style.activeWord, scale } })
							}
						/>
					</PanelCard>
				</>
			)}
		</>
	);
}
