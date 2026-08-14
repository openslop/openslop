import { RenderElementProps } from "slate-react";
import { Node } from "slate";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { ZERO_WIDTH_SPACE } from "@/lib/canvas/constants";
import { ELEMENT_CONFIGS } from "@/lib/canvas/elementConfigs";
import { useConfig } from "@/lib/config/ConfigProvider";
import { resolveElementSchema } from "@/lib/canvas/elementConnector";
import { splitTextDirection } from "../utils/textDirection";
import { OutputPreview } from "./OutputPreview";
import { DeleteButton } from "./DeleteButton";
import { DuplicateButton } from "./DuplicateButton";
import { ElementCharacters } from "./ElementCharacters";
import { AttributeBadge } from "./AttributeBadge";
import { ElementGenerateButton, ElementStaleIndicator } from "./GenerateButton";
import { ElementGenerationProvider } from "./ElementGenerationContext";
import { AnimateButton } from "./AnimateButton";
import { ElementUploadButton } from "./ElementUploadButton";
import { ModelBadge } from "./ModelBadge";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { SlidersHorizontal } from "@/components/ui/icon";

function ElementSettings({ element }: { element: CanvasContentElement }) {
	const { connectorConfig } = useConfig();
	const schema = resolveElementSchema(element, connectorConfig);
	const entries = Object.entries(schema.visibleAttributes);
	if (entries.length === 0) return null;
	return (
		<Popover>
			<SimpleTooltip label="Settings">
				<PopoverTrigger asChild>
					<button
						type="button"
						aria-label="Settings"
						onMouseDown={(e) => e.preventDefault()}
						className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-button-hover hover:text-foreground"
					>
						<SlidersHorizontal size={14} />
					</button>
				</PopoverTrigger>
			</SimpleTooltip>
			<PopoverContent align="start" className="w-64 border border-border">
				<div className="mb-2 text-label font-semibold">Settings</div>
				<div className="flex flex-col gap-2">
					{entries.map(([key, spec]) => (
						<div key={key} className="flex items-center justify-between gap-3">
							<span className="shrink-0 text-label">{spec.label}</span>
							<AttributeBadge
								element={element}
								attrKey={key}
								spec={spec}
								hideLabel
							/>
						</div>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}

interface ElementContainerProps {
	attributes: RenderElementProps["attributes"];
	element: CanvasContentElement;
	children: React.ReactNode;
}

export function ElementContainer({
	attributes,
	children,
	element,
}: ElementContainerProps) {
	const config = ELEMENT_CONFIGS[element.type];
	const isEmpty = Node.string(element) === ZERO_WIDTH_SPACE;
	const { dir, nodeAttributes } = splitTextDirection(attributes);

	return (
		<ElementGenerationProvider element={element}>
			<div
				className="flex items-stretch mb-1.5 animate-fadeInUp"
				{...nodeAttributes}
			>
				{/* Left: element card */}
				<div className="group/card @container relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-border bg-element-card p-3">
					<div className="relative z-10 min-w-0">
						<div
							className="mb-2 flex items-start gap-1.5 select-none"
							contentEditable={false}
						>
							<div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
								<span
									className={`flex h-6 w-6 @sm:w-auto shrink-0 items-center justify-center @sm:justify-start gap-1.5 rounded-md @sm:px-2 ${config.iconBgClass} ${config.colorClass}`}
								>
									<config.Icon size={16} />
									<span className="hidden font-body text-label-xs @sm:inline">
										{config.label}
									</span>
								</span>
								<ElementCharacters element={element} />
								<ModelBadge element={element} />
								<ElementSettings element={element} />
							</div>
							<div className="flex shrink-0 items-center gap-1 opacity-0 pointer-events-none transition-opacity duration-200 group-hover/card:opacity-100 group-hover/card:pointer-events-auto">
								<DuplicateButton element={element} />
								<DeleteButton element={element} />
							</div>
						</div>
						<div
							dir={dir}
							className="relative min-w-0 rounded-xl border border-transparent bg-element-input px-3 py-2.5 transition-colors hover:border-element-input-border-hover focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30"
						>
							{isEmpty && (
								<div
									style={{ userSelect: "none" }}
									className="pointer-events-none absolute top-2.5 start-3 text-start text-label text-muted-foreground"
								>
									{config.placeholder}
								</div>
							)}
							<div className="overflow-hidden text-start text-label leading-relaxed text-foreground transition-[max-height,opacity] duration-200">
								{children}
							</div>
						</div>
						<div
							className="mt-2 flex min-w-0 flex-wrap items-center justify-end gap-2 select-none"
							contentEditable={false}
						>
							<ElementStaleIndicator />
							{(element.type === "image" ||
								element.type === "animated_image") && <ElementUploadButton />}
							<AnimateButton element={element} />
							<ElementGenerateButton />
						</div>
					</div>
				</div>

				{/* Center divider */}
				<div
					className="flex shrink-0 items-stretch px-3 select-none sm:px-4"
					contentEditable={false}
					aria-hidden="true"
				>
					<div className="w-px self-stretch bg-border" />
				</div>

				{/* Right: preview */}
				<div
					className="flex-1 min-w-0 flex items-center select-none"
					contentEditable={false}
				>
					<OutputPreview element={element} />
				</div>
			</div>
		</ElementGenerationProvider>
	);
}
