import GoogleIcon from "./GoogleIcon";

interface GoogleOAuthButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
}

export default function GoogleOAuthButton({
  onClick,
  children,
}: GoogleOAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-2xl border border-white/20 bg-[#171717] text-white text-sm font-medium font-display transition-all hover:bg-[#1e1e1e] active:scale-[0.98]"
    >
      <GoogleIcon />
      {children ?? "Continue with Google"}
    </button>
  );
}
