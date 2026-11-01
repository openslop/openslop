import { RenderElementProps } from "slate-react";
import type { ContentElement } from "@/lib/canvas/types";
import { ZERO_WIDTH_SPACE } from "@/lib/canvas/constants";
import { getElementText } from "@/lib/canvas/osml-serializer";
import { elementSchema } from "@/lib/canvas/element-connector";
import type { AttributeDef } from "@/lib/connectors/attributes/schema";
import { splitTextDirection } from "../utils/text-direction";
import { OutputPreview } from "./output-preview";
import { DeleteButton } from "./delete-button";
import { DuplicateButton } from "./duplicate-button";
import { AttributeBadge } from "./attribute-badge";
import { ModelAttribute } from "./attributes/model-attribute";
import {
	ElementGenerateButton,
	ElementStaleIndicator,
} from "./generate-button";
import { ElementHistoryButton } from "./element-history-button";
import { HeaderIconButton } from "./header-icon-button";
import { ElementGenerationProvider } from "./element-generation-context";
import { ELEMENT_CONFIGS } from "./element-configs";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { SectionTitle } from "@/components/ui/section-title";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { SlidersHorizontal } from "@/components/ui/icon";

function ElementSettings({
	element,
	defs,
}: {
	element: ContentElement;
	defs: AttributeDef[];
}) {
	if (defs.length === 0) return null;
	return (
		<Popover>
			<SimpleTooltip label="Settings">
				<PopoverTrigger asChild>
					<HeaderIconButton ariaLabel="Settings">
						<SlidersHorizontal size={14} />
					</HeaderIconButton>
				</PopoverTrigger>
			</SimpleTooltip>
			<PopoverContent align="start" className="w-64 border border-border">
				<SectionTitle className="mb-2">Settings</SectionTitle>
				<div className="flex flex-col gap-2">
					{defs.map((def) => (
						<div
							key={def.key}
							className="flex items-center justify-between gap-3"
						>
							<span className="shrink-0 text-label">{def.label}</span>
							<AttributeBadge element={element} def={def} />
						</div>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}

interface ElementContainerProps {
	attributes: RenderElementProps["attributes"];
	element: ContentElement;
	children: React.ReactNode;
}

export function ElementContainer({
	attributes,
	children,
	element,
}: ElementContainerProps) {
	const config = ELEMENT_CONFIGS[element.type];
	const schema = elementSchema(element);
	const isEmpty = getElementText(element) === ZERO_WIDTH_SPACE;
	const { dir, nodeAttributes } = splitTextDirection(attributes);

	return (
		<ElementGenerationProvider element={element}>
			<div
				className="flex items-stretch mb-1.5 animate-fadeInUp"
				data-element-id={element.id}
				{...nodeAttributes}
			>
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
								{config.lead && <config.lead element={element} />}
								{!config.hidesModel && (
									<ModelAttribute
										element={element}
										label="Model"
										className="text-label-xs"
									/>
								)}
								<ElementSettings element={element} defs={schema.settingsDefs} />
								{config.tools?.map((Tool, index) => (
									<Tool key={index} element={element} />
								))}
								<ElementHistoryButton element={element} />
							</div>
							<div className="flex shrink-0 items-center gap-1 opacity-0 pointer-events-none transition-opacity duration-200 group-hover/card:opacity-100 group-hover/card:pointer-events-auto focus-within:opacity-100 focus-within:pointer-events-auto">
								<DuplicateButton element={element} />
								<DeleteButton element={element} />
							</div>
						</div>
						<div
							dir={dir}
							className="relative min-w-0 rounded-xl border border-transparent bg-element-input px-3 py-2.5 transition-colors hover:border-element-input-border-hover focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30"
						>
							{isEmpty && (
								<div className="pointer-events-none absolute top-2.5 start-3 text-start text-label text-muted-foreground select-none">
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
							{config.actions?.map((Action, index) => (
								<Action key={index} element={element} />
							))}
							<ElementGenerateButton />
						</div>
					</div>
				</div>

				<div
					className="flex shrink-0 items-stretch px-3 select-none sm:px-4"
					contentEditable={false}
					aria-hidden="true"
				>
					<div className="w-px self-stretch bg-border" />
				</div>

				<div
					className="flex-1 min-w-0 flex items-center select-none"
					contentEditable={false}
				>
					<OutputPreview outputKind={config.outputKind} />
				</div>
			</div>
		</ElementGenerationProvider>
	);
}
