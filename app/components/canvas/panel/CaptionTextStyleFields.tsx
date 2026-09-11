"use client";

import { ColorField } from "@/components/ui/color-field";
import { Bold, Italic, Thickness, Underline } from "@/components/ui/icon";
import {
	MediaToggleFlags,
	type MediaToggleOption,
} from "@/components/ui/media-toggle";
import { NumberScrubber } from "@/components/ui/number-scrubber";
import {
	CAPTION_PALETTE,
	CAPTION_RANGES,
	DEFAULT_BORDER_WIDTH,
	type CaptionEmphasis,
	type CaptionTextStyle,
} from "@/lib/video/captionStyle";
import { PanelField } from "./PanelCard";

const EMPHASIS_OPTIONS: MediaToggleOption<CaptionEmphasis>[] = [
	{ value: "bold", label: "Bold", icon: Bold },
	{ value: "italic", label: "Italic", icon: Italic },
	{ value: "underline", label: "Underline", icon: Underline },
];

/** Type, fill, border and background rows, shared by the base and active-word cards. */
export function CaptionTextStyleFields({
	value,
	onChange,
}: {
	value: CaptionTextStyle;
	onChange: (value: CaptionTextStyle) => void;
}) {
	const { border } = value;

	return (
		<>
			<PanelField label="Type">
				<MediaToggleFlags
					values={value}
					options={EMPHASIS_OPTIONS}
					onToggle={(emphasis, next) =>
						onChange({ ...value, [emphasis]: next })
					}
				/>
			</PanelField>

			<PanelField label="Fill">
				<ColorField
					label="Fill color"
					value={value.fill}
					swatches={CAPTION_PALETTE}
					onChange={(fill) => onChange({ ...value, fill })}
				/>
			</PanelField>

			<PanelField label="Border">
				<div className="flex items-center gap-1.5">
					{border && (
						<NumberScrubber
							label="Border thickness"
							icon={Thickness}
							value={border.width}
							{...CAPTION_RANGES.borderWidth}
							onChange={(width) =>
								onChange({ ...value, border: { ...border, width } })
							}
						/>
					)}
					<ColorField
						label="Border color"
						value={border?.color ?? null}
						swatches={CAPTION_PALETTE}
						empty={{
							label: "No border",
							onSelect: () => onChange({ ...value, border: null }),
						}}
						onChange={(color) =>
							onChange({
								...value,
								border: { width: border?.width ?? DEFAULT_BORDER_WIDTH, color },
							})
						}
					/>
				</div>
			</PanelField>

			<PanelField label="Background">
				<ColorField
					label="Background color"
					value={value.background}
					swatches={CAPTION_PALETTE}
					empty={{
						label: "No background",
						onSelect: () => onChange({ ...value, background: null }),
					}}
					onChange={(background) => onChange({ ...value, background })}
				/>
			</PanelField>
		</>
	);
}
