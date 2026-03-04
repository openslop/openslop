"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import OnboardingCard from "../components/OnboardingCard";
import EmailSentCard from "../components/EmailSentCard";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleMagicLink = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all placeholder:text-white/30";

  if (sent) {
    return (
      <EmailSentCard
        email={email}
        loading={loading}
        error={error}
        onResend={() => handleMagicLink()}
        onEditEmail={() => setSent(false)}
      />
    );
  }

  return (
    <OnboardingCard
      heading="Login"
      subtitle="Welcome back to OpenSlop"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-white/70 underline underline-offset-2 hover:text-white transition-colors"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleMagicLink} className="w-full flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          style={{ fontFamily: "'Google Sans Flex', sans-serif" }}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          style={{
            fontFamily: "'Google Sans Flex', sans-serif",
            background: "linear-gradient(135deg, #b8860b, #d4a017, #c4922a)",
          }}
        >
          {loading ? "Sending..." : "Send login link"}
        </button>
      </form>

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      {/* Divider */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span
          className="text-white/30 text-xs"
          style={{ fontFamily: "'Google Sans Flex', sans-serif" }}
        >
          OR
        </span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-white/20 bg-white/5 text-white text-sm font-medium transition-all hover:bg-white/10 active:scale-[0.98]"
        style={{ fontFamily: "'Google Sans Flex', sans-serif" }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>
    </OnboardingCard>
  );
}
