import type { Mode } from "@/lib/config/ConfigProvider";

export default function ModeToggle({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (mode: Mode) => void;
}) {
  return (
    <div className="relative flex rounded-full border border-white/10 bg-white/5 p-1.5">
      <div
        className="grain grain-12 absolute inset-1 w-[calc(50%-4px)] rounded-full bg-[#2d2040]/60 transition-transform duration-300 ease-out"
        style={{
          transform: mode === "prompt" ? "translateX(0)" : "translateX(100%)",
        }}
      />
      {(["prompt", "inputScript"] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`font-body relative z-10 rounded-full px-5 py-1.5 text-sm transition-colors duration-300 ${
            mode === m ? "text-violet-300" : "text-white/40 hover:text-white/60"
          }`}
        >
          {m === "prompt" ? "Prompt" : "Script"}
        </button>
      ))}
    </div>
  );
}
