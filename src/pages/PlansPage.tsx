import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Magnet, Check, Crown, Rocket, Zap, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type PlanType = "free" | "pro" | "business";

interface Plan {
  id: PlanType;
  name: string;
  price: string;
  priceValue: number;
  description: string;
  icon: React.ReactNode;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Grátis",
    price: "R$ 0",
    priceValue: 0,
    description: "Perfeito para testar a plataforma",
    icon: <Zap className="w-6 h-6" />,
    features: [
      "1 página por mês",
      "Templates básicos",
      "Marca d'água PageMagnet",
      "Suporte por email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 29,90",
    priceValue: 29.90,
    description: "Ideal para profissionais",
    icon: <Rocket className="w-6 h-6" />,
    popular: true,
    features: [
      "Páginas ilimitadas",
      "Templates premium",
      "Exportação HTML",
      "Sem marca d'água",
      "Suporte prioritário",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "R$ 79,90",
    priceValue: 79.90,
    description: "Para equipes e agências",
    icon: <Crown className="w-6 h-6" />,
    features: [
      "Tudo do Pro",
      "Templates exclusivos",
      "Domínio personalizado",
      "API de integração",
      "Gerente de conta dedicado",
    ],
  },
];

const PlansPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, loading, updatePlan, createCheckout, checkSubscription, subscriptionStatus } = useAuth();
  const { toast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(
    () => new URLSearchParams(window.location.search).get("checkout") === "success"
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Handle checkout success - confirm payment with Stripe before unlocking
  useEffect(() => {
    if (searchParams.get("checkout") !== "success" || !user) return;

    let cancelled = false;
    let attempts = 0;

    const confirm = async () => {
      while (!cancelled && attempts < 10) {
        attempts += 1;
        await checkSubscription();
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      if (!cancelled) setConfirmingPayment(false);
    };

    confirm();
    return () => {
      cancelled = true;
    };
  }, [searchParams, user, checkSubscription]);

  // Once Stripe confirms the paid subscription, unlock the app
  useEffect(() => {
    if (searchParams.get("checkout") === "success" && subscriptionStatus?.subscribed) {
      setConfirmingPayment(false);
      toast({
        title: "Pagamento confirmado!",
        description: "Sua assinatura está ativa. Bem-vindo!",
      });
      navigate("/app");
    }
  }, [searchParams, subscriptionStatus, toast, navigate]);

  // Handle checkout canceled
  useEffect(() => {
    if (searchParams.get("checkout") === "canceled") {
      toast({
        variant: "destructive",
        title: "Checkout cancelado",
        description: "A assinatura não foi concluída. Escolha um plano para continuar.",
      });
    }
  }, [searchParams, toast]);

  // If user already has a plan selected (and not coming from checkout flow), redirect to app
  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    if (!loading && profile && (profile as any).has_selected_plan && !checkoutStatus) {
      navigate("/app");
    }
  }, [loading, profile, navigate, searchParams]);


  const handleSelectPlan = async (planId: PlanType) => {
    // For free plan, just update locally
    if (planId === "free") {
      const { error } = await updatePlan(planId);
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao selecionar plano",
          description: error.message,
        });
      } else {
        toast({
          title: "Plano selecionado!",
          description: "Você está no plano gratuito.",
        });
        navigate("/app");
      }
      return;
    }

    // For paid plans, redirect to Stripe checkout
    setCheckoutLoading(planId);
    const { url, error } = await createCheckout(planId as "pro" | "business");
    setCheckoutLoading(null);

    if (error || !url) {
      toast({
        variant: "destructive",
        title: "Erro ao iniciar checkout",
        description: error?.message || "Não foi possível iniciar o checkout.",
      });
      return;
    }

    // Redirect to Stripe Checkout
    window.location.href = url;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (confirmingPayment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <h1 className="text-xl font-semibold text-foreground">Confirmando seu pagamento...</h1>
        <p className="text-muted-foreground max-w-md">
          Assim que o pagamento for confirmado, liberamos o acesso à plataforma automaticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Voltar para home
        </Link>
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg gradient-primary">
              <Magnet className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">PageMagnet</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Escolha seu plano
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Comece gratuitamente ou desbloqueie recursos avançados com nossos planos premium.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative border-2 transition-all hover:shadow-xl ${
                plan.popular 
                  ? "border-primary shadow-lg scale-105" 
                  : "border-border hover:border-primary/50"
              } ${profile?.plan === plan.id && (profile as any)?.has_selected_plan ? "ring-2 ring-primary ring-offset-2" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gradient-primary text-primary-foreground shadow-glow">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              {profile?.plan === plan.id && (profile as any)?.has_selected_plan && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="secondary">Plano Atual</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pt-8">
                <div className={`w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                  plan.popular ? "gradient-primary text-primary-foreground" : "bg-secondary text-foreground"
                }`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.priceValue > 0 && (
                    <span className="text-muted-foreground">/mês</span>
                  )}
                </div>
                
                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        plan.popular ? "bg-primary/10 text-primary" : "bg-secondary text-foreground"
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button
                  className={`w-full ${
                    plan.popular 
                      ? "gradient-primary hover:opacity-90 shadow-glow" 
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={(profile?.plan === plan.id && (profile as any)?.has_selected_plan) || checkoutLoading !== null}
                >
                  {checkoutLoading === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : profile?.plan === plan.id && (profile as any)?.has_selected_plan
                    ? "Plano atual" 
                    : plan.priceValue === 0 
                      ? "Começar grátis" 
                      : "Assinar agora"
                  }
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Todos os planos podem ser cancelados a qualquer momento. Sem taxas ocultas.
        </p>
      </div>
    </div>
  );
};

export default PlansPage;
