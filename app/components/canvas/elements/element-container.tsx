import { RenderElementProps } from "slate-react";
import type { ContentElement } from "@/lib/canvas/types";
import { splitTextDirection } from "../utils/text-direction";
import { OutputPreview } from "./output-preview";
import { DeleteButton } from "./delete-button";
import { DuplicateButton } from "./duplicate-button";
import { ModelAttribute } from "./attributes/model-attribute";
import {
	ElementGenerateButton,
	ElementStaleIndicator,
} from "./generate-button";
import { ElementHistoryPopover } from "./element-history-popover";
import { ResetEditsButton } from "./reset-edits-button";
import { ElementGenerationProvider } from "./element-generation-context";
import { ElementSettings } from "./element-settings";
import { ElementPrompt } from "./element-input";
import { ELEMENT_CONFIGS } from "./element-configs";
import { AddMediaButton } from "./element-media-picker";

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
	const { dir, nodeAttributes } = splitTextDirection(attributes);

	return (
		<ElementGenerationProvider element={element}>
			<div
				className="flex items-stretch mb-1.5 animate-fadeInUp"
				data-element-id={element.id}
				{...nodeAttributes}
			>
				<div className="group/card @container/element relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-border bg-element-card p-3">
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
								<ElementSettings element={element} />
								{config.tools?.map((Tool, index) => (
									<Tool key={index} element={element} />
								))}
								<ElementHistoryPopover elementId={element.id} />
							</div>
							<div className="flex shrink-0 items-center gap-1 opacity-0 pointer-events-none transition-opacity duration-200 group-hover/card:opacity-100 group-hover/card:pointer-events-auto focus-within:opacity-100 focus-within:pointer-events-auto">
								<DuplicateButton element={element} />
								<DeleteButton element={element} />
							</div>
						</div>
						<ElementPrompt element={element} dir={dir}>
							{children}
						</ElementPrompt>
						<div
							className="mt-2 flex min-w-0 flex-wrap items-center justify-end gap-2 select-none"
							contentEditable={false}
						>
							<ElementStaleIndicator />
							<ResetEditsButton />
							<AddMediaButton />
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
