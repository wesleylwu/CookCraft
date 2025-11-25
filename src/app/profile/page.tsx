"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import profileIcon from "@/public/profileIcon.webp";
import { getProfile, updateProfile } from "@/database/api/profiles";

const ProfilePage = () => {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [dietaryPreferencesList, setDietaryPreferencesList] = useState<
    string[]
  >([]);
  const [allergiesList, setAllergiesList] = useState<string[]>([]);
  const [preferredCuisinesList, setPreferredCuisinesList] = useState<string[]>(
    [],
  );
  const [servingSize, setServingSize] = useState(2);

  const [newDietaryItem, setNewDietaryItem] = useState("");
  const [newAllergyItem, setNewAllergyItem] = useState("");
  const [newCuisineItem, setNewCuisineItem] = useState("");

  useEffect(() => {
    const userNotLoggedIn = !loading && !user;
    if (userNotLoggedIn) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const fetchedProfile = await getProfile();
      setDietaryPreferencesList(fetchedProfile.dietary_preferences || []);
      setAllergiesList(fetchedProfile.allergies || []);
      setPreferredCuisinesList(fetchedProfile.preferred_cuisines || []);
      setServingSize(fetchedProfile.default_serving_size || 2);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updatedProfileData = {
        dietary_preferences: dietaryPreferencesList,
        allergies: allergiesList,
        preferred_cuisines: preferredCuisinesList,
        default_serving_size: servingSize,
      };

      await updateProfile(updatedProfileData);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const addDietary = () => {
    if (newDietaryItem && !dietaryPreferencesList.includes(newDietaryItem)) {
      setDietaryPreferencesList([...dietaryPreferencesList, newDietaryItem]);
      setNewDietaryItem("");
    }
  };

  const removeDietary = (item: string) => {
    setDietaryPreferencesList(dietaryPreferencesList.filter((d) => d !== item));
  };

  const addAllergy = () => {
    if (newAllergyItem && !allergiesList.includes(newAllergyItem)) {
      setAllergiesList([...allergiesList, newAllergyItem]);
      setNewAllergyItem("");
    }
  };

  const removeAllergy = (item: string) => {
    setAllergiesList(allergiesList.filter((a) => a !== item));
  };

  const addCuisine = () => {
    if (newCuisineItem && !preferredCuisinesList.includes(newCuisineItem)) {
      setPreferredCuisinesList([...preferredCuisinesList, newCuisineItem]);
      setNewCuisineItem("");
    }
  };

  const removeCuisine = (item: string) => {
    setPreferredCuisinesList(preferredCuisinesList.filter((c) => c !== item));
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
    <div className="bg-cookcraft-white flex min-h-screen w-screen flex-col items-center p-10 py-20">
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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-cookcraft-olive text-2xl font-bold">
              Preferences
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-cookcraft-red hover:text-cookcraft-yellow cursor-pointer font-medium"
              >
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-6">
              <div>
                <label className="text-cookcraft-olive text-sm font-medium">
                  Dietary Preferences
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newDietaryItem}
                    onChange={(e) => setNewDietaryItem(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addDietary()}
                    placeholder="Add preference"
                    className="border-cookcraft-olive flex-1 rounded-2xl border-3 p-2 text-sm"
                  />
                  <button
                    onClick={addDietary}
                    className="bg-cookcraft-red hover:bg-cookcraft-yellow rounded-2xl px-4 text-sm font-bold text-white"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {dietaryPreferencesList.map((item) => (
                    <span
                      key={item}
                      className="bg-cookcraft-green text-cookcraft-olive flex items-center gap-2 rounded-2xl px-3 py-1 text-sm"
                    >
                      {item}
                      <button
                        onClick={() => removeDietary(item)}
                        className="text-cookcraft-red font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-cookcraft-olive text-sm font-medium">
                  Allergies
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newAllergyItem}
                    onChange={(e) => setNewAllergyItem(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addAllergy()}
                    placeholder="Add allergy"
                    className="border-cookcraft-olive flex-1 rounded-2xl border-3 p-2 text-sm"
                  />
                  <button
                    onClick={addAllergy}
                    className="bg-cookcraft-red hover:bg-cookcraft-yellow rounded-2xl px-4 text-sm font-bold text-white"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {allergiesList.map((item) => (
                    <span
                      key={item}
                      className="bg-cookcraft-red flex items-center gap-2 rounded-2xl px-3 py-1 text-sm text-white"
                    >
                      {item}
                      <button
                        onClick={() => removeAllergy(item)}
                        className="font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-cookcraft-olive text-sm font-medium">
                  Preferred Cuisines
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newCuisineItem}
                    onChange={(e) => setNewCuisineItem(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addCuisine()}
                    placeholder="Add cuisine"
                    className="border-cookcraft-olive flex-1 rounded-2xl border-3 p-2 text-sm"
                  />
                  <button
                    onClick={addCuisine}
                    className="bg-cookcraft-red hover:bg-cookcraft-yellow rounded-2xl px-4 text-sm font-bold text-white"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {preferredCuisinesList.map((item) => (
                    <span
                      key={item}
                      className="bg-cookcraft-yellow text-cookcraft-olive flex items-center gap-2 rounded-2xl px-3 py-1 text-sm"
                    >
                      {item}
                      <button
                        onClick={() => removeCuisine(item)}
                        className="text-cookcraft-red font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-cookcraft-olive text-sm font-medium">
                  Default Serving Size
                </label>
                <input
                  type="number"
                  value={servingSize}
                  onChange={(e) =>
                    setServingSize(parseInt(e.target.value) || 2)
                  }
                  min="1"
                  className="border-cookcraft-olive mt-2 w-full rounded-2xl border-3 p-2"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-cookcraft-red hover:bg-cookcraft-yellow disabled:bg-cookcraft-green flex-1 rounded-2xl p-4 text-lg font-bold text-white transition-colors"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    loadUserProfile();
                  }}
                  className="border-cookcraft-olive text-cookcraft-olive hover:bg-cookcraft-white flex-1 rounded-2xl border-3 p-4 text-lg font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-cookcraft-olive text-sm font-medium">
                  Dietary Preferences
                </label>
                <p className="text-cookcraft-olive mt-1 text-lg font-normal">
                  {dietaryPreferencesList.length > 0
                    ? dietaryPreferencesList.join(", ")
                    : "None"}
                </p>
              </div>

              <div>
                <label className="text-cookcraft-olive text-sm font-medium">
                  Allergies
                </label>
                <p className="text-cookcraft-olive mt-1 text-lg font-normal">
                  {allergiesList.length > 0 ? allergiesList.join(", ") : "None"}
                </p>
              </div>

              <div>
                <label className="text-cookcraft-olive text-sm font-medium">
                  Preferred Cuisines
                </label>
                <p className="text-cookcraft-olive mt-1 text-lg font-normal">
                  {preferredCuisinesList.length > 0
                    ? preferredCuisinesList.join(", ")
                    : "None"}
                </p>
              </div>

              <div>
                <label className="text-cookcraft-olive text-sm font-medium">
                  Default Serving Size
                </label>
                <p className="text-cookcraft-olive mt-1 text-lg font-normal">
                  {servingSize} servings
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-cookcraft-olive mt-8 border-t-2 pt-6">
          <button
            onClick={handleUserSignOut}
            className="bg-cookcraft-red hover:bg-cookcraft-yellow w-full cursor-pointer rounded-2xl p-4 text-lg font-bold text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
