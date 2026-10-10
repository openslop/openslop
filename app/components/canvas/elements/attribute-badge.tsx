import { useSlateStatic } from "slate-react";
import { MediaToggle } from "@/components/ui/media-toggle";
import { InlineMenuTrigger, SelectMenu } from "@/components/ui/select-menu";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import type { AttributeSpec } from "@/lib/connectors/attributes/schema";
import type { ContentElement } from "@/lib/canvas/types";
import {
	CONTINUITY_ATTR,
	continuityDef,
} from "@/lib/connectors/video/start-frame";
import { cn } from "@/lib/utils";
import { ContinuityReferencesPopover } from "./attributes/continuity-section";
import { ReferenceImagesPopover } from "./attributes/reference-images-popover";
import { StartFramePicker } from "./attributes/start-frame-picker";
import { ModelAttribute } from "./attributes/model-attribute";
import { TextAttributePopover } from "./attributes/text-attribute-popover";
import { flatAttributes } from "@/lib/canvas/element-attributes";

const UNSET = "—";

function formatValue(value: string, unit?: string): string {
	if (!value) return UNSET;
	return unit ? `${value}${unit}` : value;
}

const PILL =
	"bg-secondary text-secondary-foreground text-label px-1.5 py-0.5 rounded-md max-w-[140px] truncate";

interface AttributeBadgeProps {
	element: ContentElement;
	attrKey: string;
	spec: AttributeSpec;
	hideLabel?: boolean;
	className?: string;
}

export function AttributeBadge({
	element,
	attrKey,
	spec,
	hideLabel = false,
	className,
}: AttributeBadgeProps) {
	const editor = useSlateStatic();
	const value = flatAttributes(element)[attrKey] ?? "";
	if (!value && !spec.edit) return null;

	const SpecIcon = spec.icon;
	const labeled = hideLabel ? (
		formatValue(value, spec.unit)
	) : (
		<>
			{SpecIcon ? (
				<SpecIcon
					className="mr-1 inline-block h-3 w-3 shrink-0 align-middle opacity-70"
					aria-hidden="true"
				/>
			) : (
				<span className="opacity-70 mr-1">{spec.label}</span>
			)}
			{formatValue(value, spec.unit)}
		</>
	);
	const tooltip = `${spec.label}: ${value || UNSET}`;

	if (!spec.edit) {
		return (
			<span className={cn(PILL, className)} title={tooltip}>
				{labeled}
			</span>
		);
	}

	if (spec.edit.kind === "images") {
		const popover = { element, attrKey, label: spec.label, hideLabel };
		return spec.edit.continuity ? (
			<ContinuityReferencesPopover
				{...popover}
				toggle={
					<AttributeBadge
						element={element}
						attrKey={CONTINUITY_ATTR}
						spec={continuityDef}
					/>
				}
			/>
		) : (
			<ReferenceImagesPopover {...popover} />
		);
	}

	if (spec.edit.kind === "frame") {
		return (
			<StartFramePicker
				element={element}
				attrKey={attrKey}
				label={spec.label}
				hideLabel={hideLabel}
			/>
		);
	}

	if (spec.edit.kind === "model") {
		return (
			<ModelAttribute
				element={element}
				pick={{ key: attrKey, ...spec.edit }}
				label={spec.label}
				className={className}
			/>
		);
	}

	if (spec.edit.kind === "text") {
		return (
			<TextAttributePopover
				element={element}
				attrKey={attrKey}
				value={value}
				label={spec.label}
				tooltip={tooltip}
				placeholder={spec.edit.placeholder}
				rows={spec.edit.rows}
				hideLabel={hideLabel}
			/>
		);
	}

	const handleSelect = (next: string) => {
		mergeAttrs(editor, element.id, { [attrKey]: next });
	};

	if (spec.edit.kind === "toggle") {
		const { on, off } = spec.edit;
		return (
			<MediaToggle
				value={value === "true" ? "true" : "false"}
				onChange={handleSelect}
				ariaLabel={spec.label}
				options={[
					{ value: "false", ...off },
					{ value: "true", ...on },
				]}
				className={className}
			/>
		);
	}

	return (
		<SelectMenu
			value={value}
			onChange={handleSelect}
			options={spec.edit.options.map((option) => ({
				value: option,
				label: formatValue(option, spec.unit),
			}))}
			contentClassName="max-h-64 min-w-24"
			itemClassName={className}
		>
			<InlineMenuTrigger aria-label={tooltip} className={className}>
				<span className="min-w-0 truncate">{labeled}</span>
			</InlineMenuTrigger>
		</SelectMenu>
	);
}
