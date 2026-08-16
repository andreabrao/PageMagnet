import { useState, useEffect, useRef } from "react";
import { Sparkles, Brain, PenTool, Layout, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { BriefingData } from "./WizardBriefing";
import { defaultBenefits, type PageContent } from "@/lib/pageTemplates";

interface WizardProcessingProps {
  briefingData: BriefingData;
  onComplete: (content: PageContent) => void;
}

const processingSteps = [
  { icon: Brain, text: "Analisando público-alvo e dores...", duration: 1600 },
  { icon: PenTool, text: "Escrevendo copy persuasiva com IA...", duration: 2200 },
  { icon: Layout, text: "Estruturando seções e prova social...", duration: 1600 },
  { icon: Sparkles, text: "Aplicando refinamentos profissionais...", duration: 1200 },
];

const fallbackContent = (b: BriefingData): PageContent => ({
  headline: b.transformation,
  subheadline: `O ${b.product} feito para ${b.audience.toLowerCase()}`,
  cta: "Quero Começar Agora",
  badge: "Oferta especial",
  product: b.product,
  benefits: defaultBenefits,
  testimonials: [],
  faq: [],
  guarantee: "Garantia incondicional de 30 dias. Se não gostar, devolvemos tudo.",
  urgency: "Vagas limitadas para esta turma.",
});

const WizardProcessing = ({ briefingData, onComplete }: WizardProcessingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [animationDone, setAnimationDone] = useState(false);
  const [content, setContent] = useState<PageContent | null>(null);
  const requested = useRef(false);
  const { toast } = useToast();

  // Kick off the AI generation once
  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-copy", {
          body: briefingData,
        });
        if (error || !data || (data as any).error) throw error ?? new Error((data as any)?.error);

        const d = data as any;
        setContent({
          headline: d.headline,
          subheadline: d.subheadline,
          cta: d.cta,
          badge: d.badge,
          product: briefingData.product,
          benefits: Array.isArray(d.benefits) && d.benefits.length ? d.benefits : defaultBenefits,
          testimonials: Array.isArray(d.testimonials) ? d.testimonials : [],
          faq: Array.isArray(d.faq) ? d.faq : [],
          guarantee: d.guarantee,
          urgency: d.urgency,
        });
      } catch (err) {
        console.error("generate-copy failed", err);
        toast({
          title: "IA indisponível no momento",
          description: "Geramos uma versão base para você editar.",
        });
        setContent(fallbackContent(briefingData));
      }
    })();
  }, [briefingData, toast]);

  useEffect(() => {
    if (currentStep >= processingSteps.length) {
      setAnimationDone(true);
      return;
    }

    const timer = setTimeout(() => {
      setCompletedSteps((prev) => [...prev, currentStep]);
      setCurrentStep((prev) => prev + 1);
    }, processingSteps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep]);

  useEffect(() => {
    if (animationDone && content) {
      const t = setTimeout(() => onComplete(content), 400);
      return () => clearTimeout(t);
    }
  }, [animationDone, content, onComplete]);

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Animated Logo */}
        <div className="mb-8 animate-fade-up">
          <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl gradient-primary shadow-glow">
            <Sparkles className="w-12 h-12 text-primary-foreground animate-pulse" />
            <div className="absolute inset-0 rounded-2xl gradient-primary opacity-50 blur-xl animate-pulse" />
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Criando sua página
        </h2>
        <p className="text-muted-foreground mb-8 animate-fade-up" style={{ animationDelay: "0.15s" }}>
          Aguarde enquanto a IA trabalha sua mágica...
        </p>

        <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {processingSteps.map((step, index) => {
            const isActive = currentStep === index || (animationDone && !content && index === processingSteps.length - 1);
            const isCompleted = completedSteps.includes(index) && !(isActive && !content);
            const Icon = isCompleted ? CheckCircle : step.icon;

            return (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-card shadow-lg border border-primary/20"
                    : isCompleted
                    ? "bg-card/50 border border-border"
                    : "bg-transparent opacity-50"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                    isCompleted
                      ? "bg-green-100 text-green-600"
                      : isActive
                      ? "gradient-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`} />
                </div>
                <span
                  className={`font-medium ${
                    isCompleted ? "text-green-600" : isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WizardProcessing;
