import { supabase } from "@/database/supabase";
import { UpdateProfileInput } from "@/types/database";

export async function getProfile() {
  const userResponse = await supabase.auth.getUser();
  const currentUser = userResponse.data.user;

  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const response = await supabase
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  if (response.error) {
    throw response.error;
  }

  return response.data;
}

export async function updateProfile(updates: UpdateProfileInput) {
  const userResponse = await supabase.auth.getUser();
  const currentUser = userResponse.data.user;

  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const response = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", currentUser.id)
    .select()
    .single();

  if (response.error) {
    throw response.error;
  }

  return response.data;
}
