import { JSX } from "react";
import { RenderElementProps, ReactEditor, useSlateStatic } from "slate-react";
import { Node } from "slate";
import type { CanvasContentElement, SceneElement } from "@/lib/canvas/types";
import { isSceneElement } from "@/lib/canvas/scenes";
import { ZERO_WIDTH_SPACE } from "@/lib/canvas/constants";
import { ELEMENT_CONFIGS } from "@/lib/canvas/elementConfigs";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import {
	isKnownProvider,
	resolveAttributeSchema,
} from "@/lib/connectors/factory";
import { useViewMode } from "../ViewModeContext";
import { OutputPreview } from "./OutputPreview";
import { DeleteButton } from "./DeleteButton";
import { CompactElement } from "./CompactElement";
import { SceneContainer } from "./SceneContainer";
import { ElementCharacters } from "./ElementCharacters";
import { AttributeBadge } from "./AttributeBadge";
import { ElementGenerateButton, ElementStaleIndicator } from "./GenerateButton";
import { AnimateButton } from "./AnimateButton";
import { ModelBadge } from "./ModelBadge";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { SlidersHorizontal } from "@/components/ui/icon";
import type { ElementConfig } from "@/lib/canvas/elementConfigs";

function ElementSettings({
	element,
	config,
}: {
	element: CanvasContentElement;
	config: ElementConfig;
}) {
	const { connectorConfig } = useConfig();
	const { model, provider } = element.customAttributes ?? {};
	const fallback = getDefaultConnector(connectorConfig, config.connector);
	// A persisted provider that's since been renamed/removed from the registry
	// must not reach resolveAttributeSchema, which throws for unknown providers.
	// Guard against the factory's own provider map, not connectorConfig — they're
	// independently maintained and can drift.
	const resolvedProvider =
		provider && isKnownProvider(config.connector, provider)
			? provider
			: fallback.provider;
	const schema = resolveAttributeSchema(
		config.connector,
		resolvedProvider,
		model ?? fallback.config.defaultModel,
	);
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

	return (
		<div className="flex items-stretch mb-1.5 animate-fadeInUp" {...attributes}>
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
								{config.icon}
								<span className="hidden font-body text-label-xs @sm:inline">
									{config.label}
								</span>
							</span>
							<ElementCharacters element={element} />
							<ModelBadge element={element} />
							<ElementSettings element={element} config={config} />
						</div>
						<div className="shrink-0 opacity-0 pointer-events-none transition-opacity duration-200 group-hover/card:opacity-100 group-hover/card:pointer-events-auto">
							<DeleteButton element={element} />
						</div>
					</div>
					<div className="relative min-w-0 rounded-xl border border-transparent bg-element-input px-3 py-2.5 transition-colors hover:border-element-input-border-hover focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
						{isEmpty && (
							<div
								style={{ userSelect: "none" }}
								className="pointer-events-none absolute top-2.5 left-3 text-left text-label text-muted-foreground"
							>
								{config.placeholder}
							</div>
						)}
						<div className="overflow-hidden text-left text-label leading-relaxed text-foreground transition-[max-height,opacity] duration-200">
							{children}
						</div>
					</div>
					<div
						className="mt-2 flex items-center justify-end gap-2 select-none"
						contentEditable={false}
					>
						<ElementStaleIndicator element={element} />
						<AnimateButton element={element} />
						<ElementGenerateButton element={element} />
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
	);
}

function ContentElement(
	props: RenderElementProps & { element: CanvasContentElement },
) {
	const editor = useSlateStatic();
	const { isCollapsed, hasCollapsed } = useViewMode();

	if (hasCollapsed) {
		const path = ReactEditor.findPath(editor, props.element);
		const sceneId = (Node.parent(editor, path) as SceneElement).id;
		if (isCollapsed(sceneId)) {
			return (
				<CompactElement attributes={props.attributes} element={props.element}>
					{props.children}
				</CompactElement>
			);
		}
	}
	return <ElementContainer {...props} element={props.element} />;
}

export const renderCanvasElement = (props: RenderElementProps): JSX.Element => {
	if (isSceneElement(props.element)) {
		return (
			<SceneContainer attributes={props.attributes} element={props.element}>
				{props.children}
			</SceneContainer>
		);
	}
	return <ContentElement {...props} element={props.element} />;
};
