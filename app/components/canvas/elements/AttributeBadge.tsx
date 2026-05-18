import { Check, ChevronDown } from "lucide-react";
import { ReactEditor, useSlateStatic } from "slate-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CanvasContentElement } from "../types";
import type { AttributeSpec } from "../config/elementConfigs";
import { setNodeAttrs } from "../utils/editorOps";
import { TextAttributePopover } from "./attributes/TextAttributePopover";

const ATTRIBUTE_UNITS: Record<string, string> = { duration: "s" };

function formatValue(key: string, value: string): string {
	const unit = ATTRIBUTE_UNITS[key];
	return unit ? `${value}${unit}` : value;
}

const PILL =
	"text-white text-[12px] px-1.5 py-0.5 rounded-full max-w-[140px] truncate";

interface AttributeBadgeProps {
	element: CanvasContentElement;
	attrKey: string;
	spec: AttributeSpec;
}

export function AttributeBadge({
	element,
	attrKey,
	spec,
}: AttributeBadgeProps) {
	const editor = useSlateStatic();
	const value = element.customAttributes?.[attrKey];
	if (!value) return null;

	const labeled = (
		<>
			<span className="opacity-70 mr-1">{spec.label}</span>
			{formatValue(attrKey, value)}
		</>
	);
	const tooltip = `${spec.label}: ${value}`;

	if (!spec.edit) {
		return (
			<span className={`${spec.color} ${PILL}`} title={tooltip}>
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
					className={`${spec.color} text-white text-[12px] px-2 py-1 rounded-full max-w-[140px] inline-flex items-center gap-1.5 cursor-pointer ring-1 ring-inset ring-white/20 hover:ring-white/50 hover:brightness-110 transition-all`}
				>
					<span className="truncate min-w-0">{labeled}</span>
					<ChevronDown className="w-3 h-3 shrink-0 text-white/80" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="min-w-24 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-md shadow-black/8 p-0.5"
			>
				{spec.edit.options.map((opt) => (
					<DropdownMenuItem
						key={opt}
						onClick={() => handleSelect(opt)}
						className="cursor-pointer rounded-full px-2 py-1 text-[11px] text-white/70 hover:text-white focus:text-white focus:bg-white/10"
					>
						<span className="w-3.5 shrink-0 flex items-center justify-center">
							{opt === value && (
								<Check className="w-3 h-3 text-white" aria-hidden="true" />
							)}
						</span>
						{formatValue(attrKey, opt)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
