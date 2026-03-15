"use client";

import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import { DraggablePanelItem } from "./DraggablePanelItem";

export default function ElementPanel() {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-[60] pointer-events-auto">
      <div className="p-2 min-w-[140px]">
        <div className="flex flex-col gap-2">
          {Object.values(ELEMENT_CONFIGS).map((item) => (
            <DraggablePanelItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
