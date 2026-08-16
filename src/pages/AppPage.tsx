import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import WizardBriefing, { BriefingData } from "@/components/app/WizardBriefing";
import WizardProcessing from "@/components/app/WizardProcessing";
import WizardEditor from "@/components/app/WizardEditor";
import AppNavbar from "@/components/app/AppNavbar";
import { useAuth } from "@/contexts/AuthContext";
import type { PageContent } from "@/lib/pageTemplates";

type WizardStage = "briefing" | "processing" | "editor";

const AppPage = () => {
  const [stage, setStage] = useState<WizardStage>("briefing");
  const [briefingData, setBriefingData] = useState<BriefingData | null>(null);
  const [generatedContent, setGeneratedContent] = useState<PageContent | null>(null);
  const { user, profile, loading, subscriptionStatus } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returningFromCheckout = searchParams.get("checkout") === "success";

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    // Coming back from Stripe: wait for payment confirmation before deciding
    if (returningFromCheckout && !subscriptionStatus) return;

    const hasPaidSubscription = subscriptionStatus?.subscribed === true;
    if (profile && !(profile as any).has_selected_plan && !hasPaidSubscription) {
      navigate(returningFromCheckout ? "/planos?checkout=success" : "/planos");
    }
  }, [user, profile, loading, navigate, subscriptionStatus, returningFromCheckout]);

  const handleBriefingSubmit = (data: BriefingData) => {
    setBriefingData(data);
    setStage("processing");
  };

  const handleProcessingComplete = useCallback((content: PageContent) => {
    setGeneratedContent(content);
    setStage("editor");
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main>
        {stage === "briefing" && <WizardBriefing onSubmit={handleBriefingSubmit} />}
        {stage === "processing" && briefingData && (
          <WizardProcessing briefingData={briefingData} onComplete={handleProcessingComplete} />
        )}
        {stage === "editor" && briefingData && (
          <WizardEditor briefingData={briefingData} initialContent={generatedContent ?? undefined} />
        )}
      </main>
    </div>
  );
};

export default AppPage;
