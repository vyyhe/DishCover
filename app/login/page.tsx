"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signupParam = searchParams.get("signup");
  const [view, setView] = useState<"landing" | "login" | "signup">(
    signupParam === "1" ? "signup" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res =
        view === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });
      if (res.error) throw res.error;
      if (view === "signup" && !res.data.session) {
        router.replace("/check-email");
        return;
      }
      const userId = res.data.user?.id;
      const { data: profile } = userId
        ? await supabase.from("profiles").select("display_name, username").eq("id", userId).single()
        : { data: null };
      const hasCompletedOnboarding = !!(profile?.display_name?.trim() && profile?.username?.trim());
      router.replace(hasCompletedOnboarding ? "/dashboard" : "/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col max-w-md mx-auto">
      {/* Email / password form (Login or Sign Up) */}
      {(view === "login" || view === "signup") && (
        <div className="flex-1 flex flex-col px-6 pt-6 pb-12">
          <div className="flex items-center mb-6">
            <Link
              href="/"
              className="text-black text-xl leading-none"
              aria-label="Back"
            >
              ←
            </Link>
          </div>
          <h2 className="text-2xl font-bold mb-1">Sign Up</h2>
          <p className="text-sm text-zinc-600 mb-6">
            Use your email and password to continue.
          </p>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                className="rounded-xl border border-dc-gray-border bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-dc-green-border"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete={view === "login" ? "current-password" : "new-password"}
                className="rounded-xl border border-dc-gray-border bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-dc-green-border"
                required
                minLength={6}
              />
            </label>
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-full bg-dc-yellow hover:bg-dc-yellow-dark py-4 text-base font-semibold text-black disabled:opacity-50 transition"
            >
              {view === "login" ? "Sign Up" : "Create account"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
