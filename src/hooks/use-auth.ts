"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import type { User } from "@supabase/supabase-js";

type MerchantUser = Database["public"]["Tables"]["merchant_users"]["Row"];

type AuthState = {
  user: User | null;
  merchantUser: MerchantUser | null;
  loading: boolean;
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    merchantUser: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: merchantUser } = await supabase
          .from("merchant_users")
          .select("*")
          .eq("id", user.id)
          .eq("is_active", true)
          .single();

        setAuthState({ user, merchantUser, loading: false });
      } else {
        setAuthState({ user: null, merchantUser: null, loading: false });
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUser();
      } else {
        setAuthState({ user: null, merchantUser: null, loading: false });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return authState;
};
