import { useAuth } from "@/contexts/AuthContext";

type SubscriptionPlan = "free" | "pro" | "business";

interface PlanFeatures {
  // Feature flags
  canExportHTML: boolean;
  canRemoveWatermark: boolean;
  canUsePremiumTemplates: boolean;
  canUseCustomDomain: boolean;
  canUseAPI: boolean;
  hasDedicatedManager: boolean;
  pagesPerMonth: number | "unlimited";
  // Plan info
  currentPlan: SubscriptionPlan;
  isPaidPlan: boolean;
  // Helper function
  requiresPlan: (feature: keyof Omit<PlanFeatures, "currentPlan" | "isPaidPlan" | "pagesPerMonth" | "requiresPlan">) => SubscriptionPlan | null;
}

const PLAN_FEATURES: Record<SubscriptionPlan, Omit<PlanFeatures, "currentPlan" | "isPaidPlan" | "requiresPlan">> = {
  free: {
    canExportHTML: false,
    canRemoveWatermark: false,
    canUsePremiumTemplates: false,
    canUseCustomDomain: false,
    canUseAPI: false,
    hasDedicatedManager: false,
    pagesPerMonth: 1,
  },
  pro: {
    canExportHTML: true,
    canRemoveWatermark: true,
    canUsePremiumTemplates: true,
    canUseCustomDomain: false,
    canUseAPI: false,
    hasDedicatedManager: false,
    pagesPerMonth: "unlimited",
  },
  business: {
    canExportHTML: true,
    canRemoveWatermark: true,
    canUsePremiumTemplates: true,
    canUseCustomDomain: true,
    canUseAPI: true,
    hasDedicatedManager: true,
    pagesPerMonth: "unlimited",
  },
};

// Which plan unlocks each feature
const FEATURE_UNLOCK_PLAN: Record<string, SubscriptionPlan> = {
  canExportHTML: "pro",
  canRemoveWatermark: "pro",
  canUsePremiumTemplates: "pro",
  canUseCustomDomain: "business",
  canUseAPI: "business",
  hasDedicatedManager: "business",
};

export const usePlanFeatures = (): PlanFeatures => {
  const { profile, subscriptionStatus } = useAuth();
  
  // Priority: Stripe subscription for paid plans, profile for free plan
  // If user has active paid subscription in Stripe, use that
  // Otherwise, use the plan from the user's profile in the database
  const currentPlan: SubscriptionPlan = 
    (subscriptionStatus?.subscribed && subscriptionStatus?.plan !== "free") 
      ? subscriptionStatus.plan 
      : profile?.plan || "free";
  const features = PLAN_FEATURES[currentPlan];
  
  const requiresPlan = (feature: keyof Omit<PlanFeatures, "currentPlan" | "isPaidPlan" | "pagesPerMonth" | "requiresPlan">): SubscriptionPlan | null => {
    if (features[feature]) return null; // User already has access
    return FEATURE_UNLOCK_PLAN[feature] || null;
  };
  
  return {
    ...features,
    currentPlan,
    isPaidPlan: currentPlan !== "free",
    requiresPlan,
  };
};

export const getPlanDisplayName = (plan: SubscriptionPlan): string => {
  const names: Record<SubscriptionPlan, string> = {
    free: "Grátis",
    pro: "Pro",
    business: "Business",
  };
  return names[plan];
};
