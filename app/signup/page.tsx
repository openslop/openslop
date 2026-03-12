"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import OnboardingCard from "../components/OnboardingCard";
import EmailSentCard from "../components/EmailSentCard";
import GradientButton from "../components/GradientButton";
import OrDivider from "../components/OrDivider";
import GoogleOAuthButton from "../components/GoogleOAuthButton";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
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
        data: { full_name: fullName },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  if (sent) {
    return (
      <EmailSentCard
        email={email}
        subtitle={`We sent a sign-up link to ${email}`}
        resendLabel="Send another sign-up link"
        loading={loading}
        error={error}
        onResend={() => handleMagicLink()}
        onEditEmail={() => setSent(false)}
      />
    );
  }

  return (
    <OnboardingCard
      heading="Sign up"
      subtitle="Create your account to start using OpenSlop"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-white/70 underline underline-offset-2 hover:text-white transition-colors"
          >
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleMagicLink} className="w-full flex flex-col gap-3">
        <input
          type="text"
          name="fullName"
          autoComplete="name"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="input-auth"
          required
        />
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-auth"
          required
        />
        <GradientButton type="submit" disabled={loading} className="mt-1">
          {loading ? "Sending\u2026" : "Send signup link"}
        </GradientButton>
      </form>

      {error && (
        <p aria-live="polite" className="text-red-400 text-sm text-center">
          {error}
        </p>
      )}

      <OrDivider />
      <GoogleOAuthButton onClick={handleGoogleSignup} />
    </OnboardingCard>
  );
}
