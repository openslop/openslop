import { GripVertical } from "lucide-react";
import { ElementConfig } from "../config/elementConfigs";

interface PanelItemProps extends React.HTMLAttributes<HTMLDivElement> {
  item: ElementConfig;
  ref?: React.Ref<HTMLDivElement>;
}

export function PanelItem({ item, ref, ...props }: PanelItemProps) {
  return (
    <div className="flex items-center gap-2 cursor-move" ref={ref} {...props}>
      <GripVertical
        size={14}
        className="text-white/40 flex-shrink-0"
        aria-hidden="true"
      />
      <div
        className={`grain relative overflow-hidden rounded-lg ${item.bgColor} shadow-md flex-1
          transition-[transform,filter] duration-200 motion-reduce:transition-none hover:brightness-110`}
      >
        <div className="relative z-10 flex items-center gap-2 px-3 py-2">
          <span className="text-white/80">{item.icon}</span>
          <span className="text-sm font-medium text-white/90">
            {item.label}
          </span>
        </div>
      </div>
    </div>
  );
}
