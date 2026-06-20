import { ChevronDown } from "@/components/ui/icon";
import { useSlateStatic } from "slate-react";
import { SelectMenu } from "@/components/ui/select-menu";
import { updateElementAttrs } from "@/app/components/canvas/utils/nodeOps";
import type { AttributeSpec } from "@/lib/canvas/elementConfigs";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { TextAttributePopover } from "./attributes/TextAttributePopover";

const ATTRIBUTE_UNITS: Record<string, string> = { duration: "s" };

function formatValue(key: string, value: string): string {
	const unit = ATTRIBUTE_UNITS[key];
	return unit ? `${value}${unit}` : value;
}

const PILL =
	"bg-secondary text-secondary-foreground text-label px-1.5 py-0.5 rounded-md max-w-[140px] truncate";

interface AttributeBadgeProps {
	element: CanvasContentElement;
	attrKey: string;
	spec: AttributeSpec;
	hideLabel?: boolean;
}

export function AttributeBadge({
	element,
	attrKey,
	spec,
	hideLabel = false,
}: AttributeBadgeProps) {
	const editor = useSlateStatic();
	const value = element.customAttributes?.[attrKey] ?? "";
	const isTextEdit = spec.edit?.kind === "text";
	if (!value && !isTextEdit) return null;

	const SpecIcon = spec.icon;
	const labeled = hideLabel ? (
		formatValue(attrKey, value)
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
			{formatValue(attrKey, value)}
		</>
	);
	const tooltip = `${spec.label}: ${value || ""}`;

	if (!spec.edit) {
		return (
			<span className={PILL} title={tooltip}>
				{labeled}
			</span>
		);
	}

	if (spec.edit.kind === "text") {
		return (
			<TextAttributePopover
				element={element}
				attrKey={attrKey}
				value={value}
				label={spec.label}
				color={spec.color}
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
				label: formatValue(attrKey, opt),
			}))}
			contentClassName="max-h-64 min-w-24"
		>
			<button
				aria-label={tooltip}
				onMouseDown={(e) => e.preventDefault()}
				className="inline-flex max-w-[140px] cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-label text-muted-foreground transition-colors hover:bg-button-hover hover:text-foreground"
			>
				<span className="min-w-0 truncate">{labeled}</span>
				<ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
			</button>
		</SelectMenu>
	);
}
