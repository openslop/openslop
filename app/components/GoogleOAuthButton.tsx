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
      className="relative grain grain-12 w-full flex items-center justify-center gap-2.5 py-2.5 rounded-2xl bg-[#1e1e1e]/60 text-white text-sm font-medium font-display transition-[filter,transform] hover:brightness-[1.3] active:scale-[0.98]"
    >
      <GoogleIcon />
      {children ?? "Continue with Google"}
    </button>
  );
}
