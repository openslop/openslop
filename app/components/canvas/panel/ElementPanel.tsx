"use client";

import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import { DraggablePanelItem } from "./DraggablePanelItem";

const ELEMENT_LIST = Object.values(ELEMENT_CONFIGS);

export default function ElementPanel() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">
        Elements
      </h2>
      {ELEMENT_LIST.map((item) => (
        <DraggablePanelItem key={item.id} item={item} />
      ))}
    </div>
  );
}
