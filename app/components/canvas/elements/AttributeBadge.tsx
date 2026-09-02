import { useSlateStatic } from "slate-react";
import { InlineMenuTrigger, SelectMenu } from "@/components/ui/select-menu";
import { updateElementAttrs } from "@/app/components/canvas/utils/nodeOps";
import type { AttributeSpec } from "@/lib/connectors/attributes/schema";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { cn } from "@/lib/utils";
import { ReferenceImagesPopover } from "./attributes/ReferenceImagesPopover";
import { ModelAttribute } from "./attributes/ModelAttribute";
import { TextAttributePopover } from "./attributes/TextAttributePopover";
import { flatAttributes } from "@/lib/video/elementAttributes";

const UNSET = "—";

function formatValue(value: string, unit?: string): string {
	if (!value) return UNSET;
	return unit ? `${value}${unit}` : value;
}

const PILL =
	"bg-secondary text-secondary-foreground text-label px-1.5 py-0.5 rounded-md max-w-[140px] truncate";

interface AttributeBadgeProps {
	element: CanvasContentElement;
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
	const attrs = flatAttributes(element);
	const value = attrs[attrKey] ?? "";
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
		return (
			<ReferenceImagesPopover
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
				attrKey={attrKey}
				providerKey={spec.edit.providerKey}
				pick={{ provider: attrs[spec.edit.providerKey], model: value }}
				connector={spec.edit.connector}
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
		updateElementAttrs(editor, element, { [attrKey]: next });
	};

	return (
		<SelectMenu
			value={value}
			onChange={handleSelect}
			options={spec.edit.options.map((opt) => ({
				value: opt,
				label: formatValue(opt, spec.unit),
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
