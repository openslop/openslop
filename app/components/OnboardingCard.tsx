import OpenSlopLogo from "./OpenSlopLogo";

interface OnboardingCardProps {
  heading: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
}

export default function OnboardingCard({
  heading,
  subtitle,
  children,
  footer,
  icon,
  extra,
}: OnboardingCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-3 sm:px-4 py-8">
      {/* Top-left branding */}
      <span
        className="absolute top-6 left-6 text-2xl tracking-tight text-white"
        style={{ fontFamily: "Sentient, serif" }}
      >
        OpenSlop
      </span>

      {/* Outer glass card */}
      <div className="w-full max-w-lg rounded-4xl sm:rounded-3xl bg-black/30 backdrop-blur-xl shadow-[0_8px_40px_rgba(120,60,220,0.15),0_2px_12px_rgba(0,0,0,0.3)] p-5 sm:p-8 flex flex-col items-center gap-4 sm:gap-6">
        {/* Icon or Logo */}
        {icon ?? <OpenSlopLogo className="w-14 h-auto text-white" />}

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-light text-white text-center font-display">
          {heading}
        </h1>

        {/* Extra content (e.g. logo pill) */}
        {extra}

        {/* Subtitle */}
        <p className="text-white/50 text-center text-xs sm:text-sm font-light leading-relaxed font-display">
          {subtitle}
        </p>

        {/* Inner card */}
        <div className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col items-center gap-4">
          {children}
        </div>

        {/* Footer */}
        <p className="text-white/40 text-xs sm:text-sm font-display">
          {footer}
        </p>
      </div>
    </div>
  );
}
