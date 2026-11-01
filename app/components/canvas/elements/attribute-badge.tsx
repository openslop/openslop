import { useSlateStatic } from "slate-react";
import { MediaToggle } from "@/components/ui/media-toggle";
import { InlineMenuTrigger, SelectMenu } from "@/components/ui/select-menu";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import type { AttributeDef } from "@/lib/connectors/attributes/schema";
import {
	isToggleOn,
	TOGGLE_OFF,
	TOGGLE_ON,
	type ContentElement,
} from "@/lib/canvas/types";
import { continuityDef } from "@/lib/connectors/video/start-frame";
import { ContinuityReferencesPopover } from "./attributes/continuity-section";
import { ReferenceImagesPopover } from "./attributes/reference-images-popover";
import { StartFramePicker } from "./attributes/start-frame-picker";
import { TextAttributePopover } from "./attributes/text-attribute-popover";
import { InputAttributeField } from "./attributes/input-attribute-field";
import { clampedNumber, flatAttributes } from "@/lib/canvas/element-attributes";

const UNSET = "—";

function formatValue(value: string, unit?: string): string {
	if (!value) return UNSET;
	return unit ? `${value}${unit}` : value;
}

const SECONDS_FIELD = "w-20 font-numeric";

interface AttributeBadgeProps {
	element: ContentElement;
	def: AttributeDef;
}

export function AttributeBadge({ element, def }: AttributeBadgeProps) {
	const editor = useSlateStatic();
	const { key: attrKey, label, unit, edit } = def;
	if (!edit) return null;

	const value = flatAttributes(element)[attrKey] ?? "";
	const shown = formatValue(value, unit);
	const tooltip = `${label}: ${value || UNSET}`;

	if (edit.kind === "images") {
		const popover = { element, attrKey, label };
		return edit.continuity ? (
			<ContinuityReferencesPopover
				{...popover}
				toggle={<AttributeBadge element={element} def={continuityDef} />}
			/>
		) : (
			<ReferenceImagesPopover {...popover} />
		);
	}

	if (edit.kind === "frame") {
		return (
			<StartFramePicker element={element} attrKey={attrKey} label={label} />
		);
	}

	if (edit.kind === "text") {
		return (
			<TextAttributePopover
				element={element}
				attrKey={attrKey}
				value={value}
				label={label}
				tooltip={tooltip}
				placeholder={edit.placeholder}
				rows={edit.rows}
			/>
		);
	}

	if (edit.kind === "seconds") {
		const { min } = edit;
		return (
			// Keyed on the value so a trim dragged on the timeline replaces the draft.
			<InputAttributeField
				key={value}
				element={element}
				attrKey={attrKey}
				value={value}
				label={label}
				parse={(text) => clampedNumber(text, { min })?.toString()}
				inputMode="decimal"
				placeholder="Auto"
				aria-label={`${label} in seconds`}
				className={SECONDS_FIELD}
			/>
		);
	}

	const handleSelect = (next: string) => {
		mergeAttrs(editor, element.id, { [attrKey]: next });
	};

	if (edit.kind === "toggle") {
		const { on, off } = edit;
		return (
			<MediaToggle
				value={isToggleOn(value) ? TOGGLE_ON : TOGGLE_OFF}
				onChange={handleSelect}
				ariaLabel={label}
				options={[
					{ value: TOGGLE_OFF, ...off },
					{ value: TOGGLE_ON, ...on },
				]}
			/>
		);
	}

	return (
		<SelectMenu
			value={value}
			onChange={handleSelect}
			options={edit.value.options.map((option) => ({
				value: option,
				label: formatValue(option, unit),
			}))}
			contentClassName="max-h-64 min-w-24"
		>
			<InlineMenuTrigger aria-label={tooltip}>
				<span className="min-w-0 truncate">{shown}</span>
			</InlineMenuTrigger>
		</SelectMenu>
	);
}
