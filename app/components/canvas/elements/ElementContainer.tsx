import { RenderElementProps } from "slate-react";
import { Node } from "slate";
import { ChevronDown } from "lucide-react";
import type { CanvasElement } from "../types";
import { PILL_COLORS, ZERO_WIDTH_SPACE } from "../config/constants";
import { OutputPreview } from "./OutputPreview";

interface ElementContainerProps {
  attributes: RenderElementProps["attributes"];
  element: CanvasElement;
  icon: React.ReactNode;
  label: string;
  bgColor: string;
  customAttributes?: Record<string, string>;
  visibleAttributes: string[];
  children: React.ReactNode;
  placeholder?: string;
}

export function ElementContainer({
  attributes,
  icon,
  label,
  bgColor,
  customAttributes,
  visibleAttributes,
  children,
  element,
  placeholder,
}: ElementContainerProps) {
  const allAttrs = customAttributes ?? {};
  const model = allAttrs.model;
  const visibleEntries = visibleAttributes
    .filter((key) => key !== "model" && key in allAttrs)
    .map((key) => [key, allAttrs[key]] as const);
  const isEmpty = Node.string(element) === ZERO_WIDTH_SPACE;

  return (
    <div className="flex items-stretch mb-1.5 animate-fadeInUp" {...attributes}>
      {/* Left: element card */}
      <div
        className={`grain rounded-lg ${bgColor} p-2 shadow-md relative overflow-hidden flex-1 min-w-0`}
      >
        <div className="relative z-10 min-w-0">
          <div
            className="flex items-center gap-1.5 mb-1 flex-wrap select-none"
            contentEditable={false}
          >
            <div className="flex items-center gap-1 text-white font-medium">
              {icon}
              <span className="text-xs">{label}</span>
            </div>
            {visibleEntries.map(([key, value], index) =>
              value ? (
                <span
                  key={key}
                  className={`${PILL_COLORS[index % PILL_COLORS.length]} text-white text-[12px] px-1.5 py-0.5 rounded-full truncate max-w-[100px]`}
                  title={value}
                >
                  {value}
                </span>
              ) : null,
            )}
            {model && visibleAttributes.includes("model") && (
              <span className="inline-flex items-center bg-white/15 text-white text-[12px] px-1.5 py-0.5 rounded-full truncate max-w-[120px]">
                {model}
                <ChevronDown className="w-2.5 h-2.5 text-white/70 ml-0.5" />
              </span>
            )}
          </div>
          <div className="relative min-w-0">
            {isEmpty && (
              <div
                contentEditable={false}
                style={{ userSelect: "none" }}
                className="absolute top-0 left-0 text-white/50 text-xs text-left"
              >
                {placeholder}
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
        <div className="w-full bg-white/[0.03] rounded-xl p-3 border border-white/[0.06] backdrop-blur-sm">
          <OutputPreview
            type={element.type}
            characterName={customAttributes?.character}
          />
        </div>
      </div>
    </div>
  );
}
