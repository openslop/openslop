import { Check, ChevronDown } from "@/components/ui/icon";
import { ReactEditor, useSlateStatic } from "slate-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setNodeAttrs } from "@/lib/canvas/editorOps";
import type { AttributeSpec } from "@/lib/canvas/elementConfigs";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { TextAttributePopover } from "./attributes/TextAttributePopover";

const ATTRIBUTE_UNITS: Record<string, string> = { duration: "s" };

function formatValue(key: string, value: string): string {
	const unit = ATTRIBUTE_UNITS[key];
	return unit ? `${value}${unit}` : value;
}

const PILL =
	"bg-secondary text-secondary-foreground text-[12px] px-1.5 py-0.5 rounded-md max-w-[140px] truncate";

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
		const path = ReactEditor.findPath(editor, element);
		setNodeAttrs(editor, path, element, { [attrKey]: next });
	};

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<button
					aria-label={tooltip}
					onMouseDown={(e) => e.preventDefault()}
					className="inline-flex max-w-[140px] cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-muted-foreground transition-colors hover:bg-button-hover hover:text-foreground"
				>
					<span className="min-w-0 truncate">{labeled}</span>
					<ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="max-h-64 min-w-24">
				{spec.edit.options.map((opt) => (
					<DropdownMenuItem
						key={opt}
						onClick={() => handleSelect(opt)}
						className="cursor-pointer py-1 text-[11px]"
					>
						<span className="flex w-3.5 shrink-0 items-center justify-center">
							{opt === value && (
								<Check className="h-3 w-3 text-accent" aria-hidden="true" />
							)}
						</span>
						{formatValue(attrKey, opt)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
