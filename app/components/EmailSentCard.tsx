"use client";

import OnboardingCard from "./OnboardingCard";

interface EmailSentCardProps {
  email: string;
  subtitle?: string;
  resendLabel?: string;
  loading: boolean;
  error: string;
  onResend: () => void;
  onEditEmail: () => void;
}

export default function EmailSentCard({ email, subtitle, resendLabel, loading, error, onResend, onEditEmail }: EmailSentCardProps) {
  return (
    <OnboardingCard
      heading="Email sent!"
      subtitle={subtitle ?? `We sent a login link to ${email}`}
      icon={
        <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      }
      footer={
        <button
          type="button"
          onClick={onEditEmail}
          className="text-white/70 underline underline-offset-2 hover:text-white transition-colors"
        >
          Edit my email address
        </button>
      }
    >
      <button
        type="button"
        onClick={onResend}
        disabled={loading}
        className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        style={{
          fontFamily: "'Google Sans Flex', sans-serif",
          background: "linear-gradient(135deg, #b8860b, #d4a017, #c4922a)",
        }}
      >
        {loading ? "Sending..." : (resendLabel ?? "Send another login link")}
      </button>
      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}
    </OnboardingCard>
  );
}
