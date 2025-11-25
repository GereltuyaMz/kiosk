"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type MerchantUser = Database["public"]["Tables"]["merchant_users"]["Row"];

export type LoginResult =
  | { success: true; user: MerchantUser }
  | { success: false; error: string };

export const login = async (
  email: string,
  password: string
): Promise<LoginResult> => {
  const supabase = await createClient();

  // Authenticate with Supabase Auth
  const { data: authData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (signInError || !authData.user) {
    return { success: false, error: "Invalid email or password" };
  }

  // Fetch merchant user data
  const { data: merchantUser, error: userError } = await supabase
    .from("merchant_users")
    .select("*")
    .eq("id", authData.user.id)
    .eq("is_active", true)
    .single();

  console.log("userError", userError);
  console.log("merchantUser", merchantUser);

  if (userError || !merchantUser) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "User account not found or inactive",
    };
  }

  revalidatePath("/", "layout");
  return { success: true, user: merchantUser };
};

export const logout = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
};

export const getCurrentUser = async (): Promise<MerchantUser | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: merchantUser } = await supabase
    .from("merchant_users")
    .select("*")
    .eq("id", user.id)
    .eq("is_active", true)
    .single();

  return merchantUser;
};
