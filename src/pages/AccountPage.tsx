import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Crown, 
  Rocket, 
  Zap, 
  Settings, 
  CreditCard, 
  LogOut,
  ExternalLink,
  History,
  XCircle,
  Loader2,
  RotateCcw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanFeatures, getPlanDisplayName } from "@/hooks/usePlanFeatures";
import { useToast } from "@/hooks/use-toast";
import AppNavbar from "@/components/app/AppNavbar";
import AvatarUpload from "@/components/app/AvatarUpload";
import GenerationHistory from "@/components/app/GenerationHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const planIcons = {
  free: Zap,
  pro: Rocket,
  business: Crown,
};

const planColors = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-primary text-primary-foreground",
  business: "bg-amber-500 text-white",
};

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut, openCustomerPortal, subscriptionStatus, updateProfile, cancelSubscription } = useAuth();
  const { currentPlan, isPaidPlan } = usePlanFeatures();
  const { toast } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const isCanceling = subscriptionStatus?.cancel_at_period_end === true;

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    const { error } = await cancelSubscription("cancel");
    setCancelLoading(false);
    setCancelOpen(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao cancelar",
        description: error.message || "Não foi possível cancelar a cobrança.",
      });
      return;
    }

    toast({
      title: "Cobrança cancelada",
      description: "Você continua com acesso até o fim do período já pago.",
    });
  };

  const handleReactivateSubscription = async () => {
    setCancelLoading(true);
    const { error } = await cancelSubscription("reactivate");
    setCancelLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao reativar",
        description: error.message || "Não foi possível reativar a assinatura.",
      });
      return;
    }

    toast({
      title: "Assinatura reativada",
      description: "A renovação automática foi restabelecida.",
    });
  };

  const handleAvatarUpdate = (url: string) => {
    updateProfile({ avatar_url: url });
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleManageSubscription = async () => {
    const { url, error } = await openCustomerPortal();
    
    if (error || !url) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível abrir o portal de assinatura.",
      });
      return;
    }
    
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const PlanIcon = planIcons[currentPlan];

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="bg-gradient-to-br from-background via-secondary/20 to-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Configurações da Conta</h1>
            <p className="text-muted-foreground">Gerencie seu perfil e assinatura</p>
          </div>

        <Tabs defaultValue="conta" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="conta" className="gap-2">
              <User className="w-4 h-4" />
              Conta
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2">
              <History className="w-4 h-4" />
              Histórico de gerações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conta">
        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <AvatarUpload
                userId={user.id}
                currentAvatarUrl={profile.avatar_url}
                fullName={profile.full_name}
                onAvatarUpdate={handleAvatarUpdate}
                size="lg"
              />
              <div>
                <p className="font-medium text-foreground">{profile.full_name || "Usuário"}</p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Clique na foto para alterar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Assinatura
            </CardTitle>
            <CardDescription>
              Gerencie seu plano e método de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Plan */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${planColors[currentPlan]}`}>
                  <PlanIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">Plano {getPlanDisplayName(currentPlan)}</p>
                    <Badge variant={isPaidPlan ? "default" : "secondary"}>
                      {isPaidPlan ? "Ativo" : "Grátis"}
                    </Badge>
                  </div>
                  {subscriptionStatus?.subscription_end && (
                    <p className="text-sm text-muted-foreground">
                      {isCanceling ? "Acesso até" : "Renova em"}: {new Date(subscriptionStatus.subscription_end).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                  {isCanceling && (
                    <Badge variant="destructive" className="mt-1">Cobrança cancelada</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Plan Features Summary */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Recursos do seu plano:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {currentPlan === "free" && (
                  <>
                    <li>• 1 página por mês</li>
                    <li>• Templates básicos</li>
                    <li>• Marca d'água PageMagnet</li>
                  </>
                )}
                {currentPlan === "pro" && (
                  <>
                    <li>• Páginas ilimitadas</li>
                    <li>• Templates premium</li>
                    <li>• Exportação HTML</li>
                    <li>• Sem marca d'água</li>
                  </>
                )}
                {currentPlan === "business" && (
                  <>
                    <li>• Tudo do Pro</li>
                    <li>• Templates exclusivos</li>
                    <li>• Domínio personalizado</li>
                    <li>• API de integração</li>
                    <li>• Gerente dedicado</li>
                  </>
                )}
              </ul>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {isPaidPlan ? (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleManageSubscription}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Gerenciar Assinatura
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  className="flex-1 gradient-primary hover:opacity-90 shadow-glow"
                  onClick={() => navigate("/planos")}
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Fazer Upgrade
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/planos")}
              >
                Ver Todos os Planos
              </Button>
            </div>

            {isPaidPlan && (
              isCanceling ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleReactivateSubscription}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4 mr-2" />
                  )}
                  Reativar renovação automática
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setCancelOpen(true)}
                  disabled={cancelLoading}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancelar cobrança
                </Button>
              )
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair da Conta
            </Button>
          </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="historico">
            <GenerationHistory />
          </TabsContent>
        </Tabs>
        </div>
      </div>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar cobrança da assinatura?</AlertDialogTitle>
            <AlertDialogDescription>
              A renovação automática será desativada. Você continua com todos os recursos do plano
              {subscriptionStatus?.subscription_end
                ? ` até ${new Date(subscriptionStatus.subscription_end).toLocaleDateString("pt-BR")}`
                : " até o fim do período já pago"}
              , e depois sua conta volta para o plano Grátis. Você pode reativar quando quiser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelLoading}>Manter assinatura</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCancelSubscription();
              }}
              disabled={cancelLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountPage;
