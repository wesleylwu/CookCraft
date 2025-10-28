"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/public/home/cookCraftLogo.webp";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const router = useRouter();
  
  if (user) {
    router.push("/profile");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setEmailSent(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cookcraft-white flex h-screen w-screen flex-col items-center justify-center">
      <div className="text-cookcraft-olive mb-8 flex flex-col items-center">
        <Image src={logo} alt="CookCraft Logo" className="mb-6 w-48" />
        <h1 className="text-4xl font-bold">Welcome to CookCraft</h1>
        <p className="text-cookcraft-olive mt-2 text-lg font-normal">
          Sign in to start cooking
        </p>
      </div>

      {!emailSent ? (
        <form
          onSubmit={handleLogin}
          className="border-cookcraft-olive bg-cookcraft-white flex w-full max-w-md flex-col gap-4 rounded-2xl border-3 p-8"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-cookcraft-olive text-lg font-medium"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-cookcraft-olive rounded-2xl border-3 p-4 text-lg focus:border-cookcraft-red focus:outline-none"
            />
          </div>

          {error && (
            <div className="bg-cookcraft-red rounded-xl p-3 text-white">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-cookcraft-red hover:bg-cookcraft-yellow disabled:bg-cookcraft-green mt-2 rounded-2xl p-4 text-lg font-bold text-white transition-colors disabled:cursor-not-allowed"
          >
            {loading ? "Sending Magic Link..." : "Send Magic Link"}
          </button>

          <p className="text-cookcraft-olive mt-2 text-center text-sm">
            We&apos;ll send you a link to your email to sign in!
          </p>
        </form>
      ) : (
        <div className="border-cookcraft-green bg-cookcraft-white flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border-3 p-8">
          <div className="bg-cookcraft-green flex h-16 w-16 items-center justify-center rounded-full">
            <svg
              className="text-cookcraft-olive h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-cookcraft-olive text-2xl font-bold">
            Check your email!
          </h2>
          <p className="text-cookcraft-olive text-center">
            We&apos;ve sent a magic link to <strong>{email}</strong>
          </p>
          <p className="text-cookcraft-olive text-center text-sm">
            Click the link in the email to sign in.
          </p>
          <button
            onClick={() => {
              setEmailSent(false);
              setEmail("");
            }}
            className="text-cookcraft-red mt-4 font-medium underline"
          >
            Try a different email
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

