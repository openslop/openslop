import { JSX } from "react";
import { RenderElementProps } from "slate-react";
import { Node } from "slate";
import type { ProviderKey } from "@/lib/connectors/types";
import type { CanvasContentElement } from "../types";
import { isSceneElement } from "../utils/guards";
import { ZERO_WIDTH_SPACE } from "../config/constants";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import { useGenerate } from "../hooks/useGenerate";
import { OutputPreview } from "./OutputPreview";
import { ModelSelector } from "./ModelSelector";
import { DeleteButton } from "./DeleteButton";
import { SceneContainer } from "./SceneContainer";

const ATTRIBUTE_UNITS: Record<string, string> = { duration: "s" };

function formatAttributeDisplay(key: string, value: string): string {
  const unit = ATTRIBUTE_UNITS[key];
  return unit ? `${value}${unit}` : value;
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
  const { model, provider } = element.customAttributes ?? {};
  const isEmpty = Node.string(element) === ZERO_WIDTH_SPACE;
  const gen = useGenerate(element);

  return (
    <div className="flex items-stretch mb-1.5 animate-fadeInUp" {...attributes}>
      {/* Left: element card */}
      <div
        className={`group/card grain rounded-lg ${config.bgColor} p-2 shadow-md relative overflow-hidden flex-1 min-w-0`}
      >
        <div
          className="absolute top-1.5 right-1.5 z-20 opacity-0 pointer-events-none group-hover/card:opacity-100 group-hover/card:pointer-events-auto transition-opacity duration-200"
          contentEditable={false}
        >
          <DeleteButton element={element} />
        </div>
        <div className="relative z-10 min-w-0">
          <div
            className="flex items-center gap-1.5 mb-1 flex-wrap select-none"
            contentEditable={false}
          >
            <div className="flex items-center gap-1 text-white font-medium">
              {config.icon}
              <span className="text-xs">{config.label}</span>
            </div>
            {Object.entries(config.visibleAttributes).map(([key, color]) => {
              const value = element.customAttributes?.[key];
              return value ? (
                <span
                  key={key}
                  className={`${color} text-white text-[12px] px-1.5 py-0.5 rounded-full truncate max-w-[100px]`}
                  title={value}
                >
                  {formatAttributeDisplay(key, value)}
                </span>
              ) : null;
            })}
            {model && provider && (
              <ModelSelector
                element={element}
                model={model}
                provider={provider as ProviderKey}
              />
            )}
          </div>
          <div className="relative min-w-0">
            {isEmpty && (
              <div
                contentEditable={false}
                style={{ userSelect: "none" }}
                className="absolute top-0 left-0 text-white/50 text-xs text-left"
              >
                {config.placeholder}
              </div>
            )}
            <div className="text-white/90 text-xs leading-relaxed overflow-hidden transition-[max-height,opacity] duration-200 text-left">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Center divider */}
      <div
        className="relative flex-shrink-0 w-px self-stretch mx-3 sm:mx-4"
        contentEditable={false}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 w-px"
          style={{
            background: "rgba(255,255,255,0.15)",
            boxShadow:
              "0 0 6px 1px rgba(255,255,255,0.05), 0 0 16px 2px rgba(167,139,250,0.03)",
          }}
        />
      </div>

      {/* Right: preview */}
      <div className="flex-1 min-w-0 flex items-center" contentEditable={false}>
        <OutputPreview
          type={element.type}
          generating={gen.generating}
          queued={gen.queued}
          seconds={gen.seconds}
          result={gen.result}
          error={gen.error}
          onGenerate={gen.generate}
          onDiscard={gen.discard}
        />
      </div>
    </div>
  );
}

export const renderCanvasElement = (props: RenderElementProps): JSX.Element => {
  if (isSceneElement(props.element)) {
    return (
      <SceneContainer attributes={props.attributes} element={props.element}>
        {props.children}
      </SceneContainer>
    );
  }
  return <ElementContainer {...props} element={props.element} />;
};
