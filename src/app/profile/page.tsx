"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import profileIcon from "@/public/profileIcon.webp";

const ProfilePage = () => {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="bg-cookcraft-white text-cookcraft-olive flex h-screen w-screen flex-col items-center justify-center">
        <div className="border-cookcraft-olive h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
        <p className="mt-4 text-xl font-medium">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-cookcraft-white flex min-h-screen w-screen flex-col items-center py-20">
      <div className="border-cookcraft-olive bg-cookcraft-white w-full max-w-2xl rounded-2xl border-3 p-8">
        <div className="flex items-center gap-6">
          <Image
            src={profileIcon}
            alt="Profile Icon"
            width={80}
            height={80}
            className="rounded-full"
          />
          <div className="flex-1">
            <h1 className="text-cookcraft-olive text-3xl font-bold">
              Your Profile
            </h1>
            <p className="text-cookcraft-olive mt-1 text-lg font-normal">
              Welcome back to CookCraft!
            </p>
          </div>
        </div>

        <div className="border-cookcraft-olive mt-8 border-t-2 pt-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-cookcraft-olive text-sm font-medium">
                Email Address
              </label>
              <p className="text-cookcraft-olive mt-1 text-lg font-normal">
                {user.email}
              </p>
            </div>

            <div>
              <label className="text-cookcraft-olive text-sm font-medium">
                Account Created
              </label>
              <p className="text-cookcraft-olive mt-1 text-lg font-normal">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="border-cookcraft-olive mt-8 border-t-2 pt-6">
          <button
            onClick={handleSignOut}
            className="bg-cookcraft-red hover:bg-cookcraft-yellow w-full rounded-2xl p-4 text-lg font-bold text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

