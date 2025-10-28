"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import logo from "@/public/home/cookCraftLogo.webp";

const AuthCallbackPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1),
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;

          router.push("/profile");
        } else {
          throw new Error("No tokens found in URL");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="bg-cookcraft-white flex h-screen w-screen flex-col items-center justify-center">
        <Image src={logo} alt="CookCraft Logo" className="mb-6 w-48" />
        <div className="border-cookcraft-red bg-cookcraft-white flex w-full max-w-md flex-col gap-4 rounded-2xl border-3 p-8">
          <h2 className="text-cookcraft-red text-2xl font-bold">
            Authentication Error
          </h2>
          <p className="text-cookcraft-olive">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-cookcraft-red hover:bg-cookcraft-yellow mt-2 rounded-2xl p-4 text-lg font-bold text-white transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cookcraft-white text-cookcraft-olive flex h-screen w-screen flex-col items-center justify-center">
      <Image src={logo} alt="CookCraft Logo" className="mb-6 w-48" />
      <div className="flex flex-col items-center gap-4">
        <div className="border-cookcraft-olive h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
        <p className="text-xl font-medium">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
