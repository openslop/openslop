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
import {
	CAPTION_RANGES,
	type CaptionAlignX,
	type CaptionAlignY,
	type CaptionCasing,
} from "@/lib/captions/caption-style";
import { useCaptionStyle } from "@/lib/captions/use-caption-style";
import { useProject } from "@/lib/project/use-project";
import { useVideoSetting } from "@/lib/project/use-video-setting";
import { ModelDefaultControl } from "@/app/components/models/model-default-control";
import { groupFor } from "@/lib/connectors/model-groups";
import { useModelChain } from "@/lib/connectors/use-default-models";
import { CaptionFontLibrary } from "../caption-fonts";
import { AutoCaptionsButton } from "./auto-captions-button";
import { CaptionFontField } from "./caption-font-field";
import { CaptionPresetGrid } from "./caption-preset-grid";
import { CaptionPreview } from "./caption-preview";
import { CaptionTextStyleFields } from "./caption-text-style-fields";
import { PanelCard, PanelField } from "./panel-card";

const SPEECH_TO_TEXT = groupFor("stt");

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
	const captionsEnabled = useVideoSetting("captions");
	const updateVideoSettings = useProject((state) => state.updateVideoSettings);
	const [style, setStyle] = useCaptionStyle();
	const chain = useModelChain();
	const updateModels = useProject((state) => state.updateModels);

	return (
		<>
			<PanelCard title="Captions">
				<PanelField label="Show">
					<MediaToggle
						value={captionsEnabled ? "on" : "off"}
						onChange={(value) =>
							updateVideoSettings({ captions: value === "on" })
						}
						options={[
							{ value: "on", label: "Show captions", icon: Eye },
							{ value: "off", label: "Hide captions", icon: EyeOff },
						]}
					/>
				</PanelField>
				{captionsEnabled && (
					<>
						<PanelField
							label={SPEECH_TO_TEXT.label}
							info="Existing captions are unaffected."
						>
							<ModelDefaultControl
								types={SPEECH_TO_TEXT.types}
								tier="project"
								chain={chain}
								label={SPEECH_TO_TEXT.label}
								onChange={updateModels}
							/>
						</PanelField>
						<AutoCaptionsButton />
						<CaptionPreview style={style} />
					</>
				)}
			</PanelCard>

			{captionsEnabled && (
				<>
					<CaptionFontLibrary />

					<PanelCard title="Presets">
						<CaptionPresetGrid style={style} onSelect={setStyle} />
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

					<PanelCard title="Typography">
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
						<PanelField label="Line length">
							<NumberScrubber
								label="Line length"
								tooltip="How long a line gathers words before the next one starts; 0 shows one word at a time"
								value={style.lineMs}
								suffix="ms"
								{...CAPTION_RANGES.lineMs}
								onChange={(lineMs) => setStyle({ lineMs })}
							/>
						</PanelField>
					</PanelCard>

					<PanelCard title="Word style">
						<CaptionTextStyleFields
							value={style.base}
							onChange={(base) => setStyle({ base })}
						/>
					</PanelCard>

					<PanelCard title="Active word style">
						<CaptionTextStyleFields
							value={style.activeWord}
							onChange={(activeWord) => setStyle({ activeWord })}
						/>
					</PanelCard>
				</>
			)}
		</>
	);
}
