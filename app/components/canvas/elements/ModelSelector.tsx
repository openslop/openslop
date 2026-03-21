import { ReactEditor, useSlateStatic } from "slate-react";
import { Transforms } from "slate";
import { Check, ChevronDown } from "lucide-react";
import type { CanvasElement } from "../types";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfig } from "@/lib/config/ConfigProvider";
import type { ProviderKey } from "@/lib/connectors/types";

export function ModelSelector({
  element,
  model,
  provider,
}: {
  element: CanvasElement;
  model: string;
  provider: ProviderKey;
}) {
  const editor = useSlateStatic();
  const { connectorConfig } = useConfig();

  const connectorType = ELEMENT_CONFIGS[element.type].connector;
  const availableModels =
    connectorConfig[connectorType]?.[provider]?.models ?? [];

  const handleSelect = (newModel: string) => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(
      editor,
      { customAttributes: { ...element.customAttributes, model: newModel } },
      { at: path },
    );
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Select model, current: ${model}`}
          className="inline-flex items-center bg-white/15 text-white text-[12px] px-1.5 py-0.5 rounded-full truncate max-w-[120px] hover:bg-white/25 transition-colors"
        >
          {model}
          <ChevronDown className="w-2.5 h-2.5 text-white/70 ml-0.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="start"
        className="min-w-32 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-md shadow-black/8 p-0.5"
      >
        {availableModels.map((m) => (
          <DropdownMenuItem
            key={m}
            onClick={() => handleSelect(m)}
            className="cursor-pointer rounded-full px-2 py-1 text-[11px] text-white/70 hover:text-white focus:text-white focus:bg-white/10"
          >
            {m === model && (
              <Check className="w-3 h-3 mr-0.5 text-white" aria-hidden="true" />
            )}
            {m}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
