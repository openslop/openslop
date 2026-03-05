"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import OnboardingCard from "../components/OnboardingCard";
import EmailSentCard from "../components/EmailSentCard";
import GradientButton from "../components/GradientButton";
import OrDivider from "../components/OrDivider";
import GoogleOAuthButton from "../components/GoogleOAuthButton";

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
        shouldCreateUser: false,
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
    <OnboardingCard heading="Login" subtitle="Welcome back to OpenSlop">
      <form onSubmit={handleMagicLink} className="w-full flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-auth"
          required
        />
        <GradientButton type="submit" disabled={loading} className="mt-1">
          {loading ? "Sending..." : "Send login link"}
        </GradientButton>
      </form>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <OrDivider />
      <GoogleOAuthButton onClick={handleGoogleLogin} />
    </OnboardingCard>
  );
}
