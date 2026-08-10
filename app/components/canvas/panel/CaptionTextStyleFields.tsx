"use client";

import { ColorField } from "@/components/ui/color-field";
import {
	CAPTION_PALETTE,
	CAPTION_RANGES,
	DEFAULT_BORDER_WIDTH,
	type CaptionTextStyle,
} from "@/lib/video/captionStyle";
import { PanelField, PanelSlider } from "./PanelCard";

/** Fill / border / background rows, shared by the base and active-word cards. */
export function CaptionTextStyleFields<T extends CaptionTextStyle>({
	value,
	onChange,
}: {
	value: T;
	onChange: (value: T) => void;
}) {
	const { border } = value;

	return (
		<>
			<PanelField label="Fill">
				<ColorField
					label="Fill color"
					value={value.fill}
					swatches={CAPTION_PALETTE}
					onChange={(fill) => onChange({ ...value, fill: fill ?? value.fill })}
				/>
			</PanelField>

			<PanelField label="Border">
				<ColorField
					label="Border color"
					value={border?.color ?? null}
					swatches={CAPTION_PALETTE}
					emptyLabel="No border"
					onChange={(color) =>
						onChange({
							...value,
							border: color
								? { width: border?.width ?? DEFAULT_BORDER_WIDTH, color }
								: null,
						})
					}
				/>
			</PanelField>
			{border && (
				<PanelSlider
					label="Thickness"
					value={border.width}
					{...CAPTION_RANGES.borderWidth}
					onChange={(width) =>
						onChange({ ...value, border: { ...border, width } })
					}
				/>
			)}

			<PanelField label="Background">
				<ColorField
					label="Background color"
					value={value.background}
					swatches={CAPTION_PALETTE}
					emptyLabel="No background"
					onChange={(background) => onChange({ ...value, background })}
				/>
			</PanelField>
		</>
	);
}
