import { GripVertical, Plus } from "lucide-react";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface InsertOption<K extends string = string> {
  key: K;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
}

interface SortableActionsProps<K extends string> {
  options?: InsertOption<K>[];
  onInsert?: (key: K) => void;
  listeners?: SyntheticListenerMap;
  onMenuOpenChange?: (open: boolean) => void;
}

export function SortableActions<K extends string>({
  options,
  onInsert,
  listeners,
  onMenuOpenChange,
}: SortableActionsProps<K>) {
  return (
    <>
      {options?.length && onInsert && (
        <DropdownMenu modal={false} onOpenChange={onMenuOpenChange}>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Insert item"
              className="inline-flex items-center rounded-md p-0.5 text-white/40
              hover:text-white/80 hover:bg-white/10 transition-[color,background-color] duration-200"
            >
              <Plus size={24} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="start"
            className="w-40 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-md shadow-black/8 p-1"
          >
            {options.map((option) => (
              <DropdownMenuItem
                key={option.key}
                onClick={() => onInsert(option.key)}
                className="cursor-pointer rounded-lg py-2 text-white/70 hover:bg-white/10 hover:text-white focus:text-white focus:bg-white/10"
              >
                <span
                  className={`${option.bgColor} inline-flex items-center justify-center rounded p-1 mr-1`}
                >
                  {option.icon}
                </span>
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <button
        aria-label="Drag to reorder"
        className="inline-flex items-center rounded-md p-0.5 text-white/40
        hover:text-white/80 hover:bg-white/10 transition-[color,background-color] duration-200
        cursor-grab active:cursor-grabbing"
        {...listeners}
      >
        <GripVertical size={24} />
      </button>
    </>
  );
}
