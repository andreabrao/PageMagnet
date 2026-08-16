import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type SubscriptionPlan = "free" | "pro" | "business";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  plan: SubscriptionPlan;
  has_selected_plan: boolean;
}

interface SubscriptionStatus {
  subscribed: boolean;
  plan: SubscriptionPlan;
  subscription_end: string | null;
  cancel_at_period_end?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updatePlan: (plan: "free") => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  checkSubscription: () => Promise<void>;
  createCheckout: (planId: "pro" | "business") => Promise<{ url: string | null; error: Error | null }>;
  openCustomerPortal: () => Promise<{ url: string | null; error: Error | null }>;
  cancelSubscription: (action?: "cancel" | "reactivate") => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (data && !error) {
      setProfile(data as Profile);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("User not authenticated") };

    // Never let the client write plan-related columns directly.
    const { plan: _plan, has_selected_plan: _hasSelectedPlan, id: _id, user_id: _userId, ...safeUpdates } = updates;
    
    const { error } = await supabase
      .from("profiles")
      .update(safeUpdates)
      .eq("user_id", user.id);
    
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...safeUpdates } : null);
    }
    
    return { error };
  };

  const checkSubscription = useCallback(async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        console.error("Error checking subscription:", error);
        return;
      }
      
      if (data) {
        setSubscriptionStatus(data as SubscriptionStatus);
        // Only update profile plan if user has an active PAID subscription from Stripe
        // This prevents overwriting the profile plan for free users
        if (data.subscribed && data.plan && data.plan !== "free") {
          // Paid subscription confirmed by Stripe: unlock the platform.
          setProfile(prev => prev ? { ...prev, plan: data.plan, has_selected_plan: true } : prev);
        }
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  }, [session, profile]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setSubscriptionStatus(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check subscription on login and periodically
  useEffect(() => {
    if (session) {
      checkSubscription();
      
      // Check every minute
      const interval = setInterval(checkSubscription, 60000);
      return () => clearInterval(interval);
    }
  }, [session, checkSubscription]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSubscriptionStatus(null);
  };

  // Paid plans are granted server-side after Stripe verification only.
  // The client may only opt into the free plan.
  const updatePlan = async (plan: "free") => {
    if (!user) return { error: new Error("User not authenticated") };
    if (plan !== "free") {
      return { error: new Error("Paid plans must be activated through checkout") };
    }
    
    const { error } = await supabase
      .from("profiles")
      .update({ plan, has_selected_plan: true })
      .eq("user_id", user.id);
    
    if (!error) {
      setProfile(prev => prev ? { ...prev, plan, has_selected_plan: true } : null);
    }
    
    return { error };
  };

  const createCheckout = async (planId: "pro" | "business") => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { planId },
      });
      
      if (error) {
        return { url: null, error };
      }
      
      return { url: data?.url || null, error: null };
    } catch (error) {
      return { url: null, error: error as Error };
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      if (error) {
        return { url: null, error };
      }
      
      return { url: data?.url || null, error: null };
    } catch (error) {
      return { url: null, error: error as Error };
    }
  };

  const cancelSubscription = async (action: "cancel" | "reactivate" = "cancel") => {
    try {
      const { data, error } = await supabase.functions.invoke("cancel-subscription", {
        body: { action },
      });

      if (error) return { error };
      if (data?.error) return { error: new Error(data.error) };

      await checkSubscription();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      subscriptionStatus,
      signUp,
      signIn,
      signOut,
      updatePlan,
      updateProfile,
      checkSubscription,
      createCheckout,
      openCustomerPortal,
      cancelSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
