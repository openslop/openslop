import { ScrollText } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export default function ScriptToggle({
  active,
  onChange,
}: {
  active: boolean;
  onChange: (active: boolean) => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => onChange(!active)}
          className={`font-body flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-violet-400/30 ${
            active
              ? "relative grain border-violet-500/30 bg-[#2d2040]/60 text-violet-300"
              : "border-white/10 bg-transparent text-white/40 hover:border-white/20 hover:text-white/60"
          }`}
        >
          <ScrollText className="h-3.5 w-3.5" />
          Script Mode
        </button>
      </TooltipTrigger>
      <TooltipContent>
        Paste an existing script instead of a prompt
      </TooltipContent>
    </Tooltip>
  );
}
