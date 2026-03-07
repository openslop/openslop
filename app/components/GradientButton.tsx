interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function GradientButton({
  children,
  className = "",
  ...props
}: GradientButtonProps) {
  return (
    <button
      className={`relative grain w-full py-2.5 rounded-2xl text-white font-semibold text-sm font-display transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 bg-gradient-gold ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
