"use client";

import { PanelLeft } from "lucide-react";
import ElementPanel from "./ElementPanel";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export default function Sidebar({ open, onToggle }: SidebarProps) {
  return (
    <div
      className={`fixed top-0 left-0 h-full z-[80] w-[calc(14rem+2.5rem)] transition-transform duration-300 motion-reduce:transition-none ${
        open ? "translate-x-0" : "-translate-x-52"
      }`}
    >
      <div
        className={`absolute inset-0 bg-white/5 backdrop-blur-xl shadow-[4px_0_16px_rgba(0,0,0,0.3)] border-r border-white/10 transition-opacity duration-300 motion-reduce:transition-none ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="relative pt-14 px-2">
        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? "Close sidebar" : "Open sidebar"}
          className="absolute right-2 top-16 p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <PanelLeft size={23} strokeWidth={1} aria-hidden="true" />
        </button>

        {open && (
          <div className="mt-10 px-2">
            <ElementPanel />
          </div>
        )}
      </div>
    </div>
  );
}
