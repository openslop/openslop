export default function OrDivider() {
  return (
    <div className="w-full flex items-center gap-3">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-white/30 text-xs font-display">OR</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}
