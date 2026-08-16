import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Magnet,
  Eye,
  Download,
  Save,
  Type,
  Palette,
  RefreshCw,
  Menu,
  X,
  Crown,
  LayoutTemplate,
  Lock,
  Globe,
  Loader2,
} from "lucide-react";
import type { BriefingData } from "./WizardBriefing";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  buildPageHtml,
  colorPalettes,
  defaultBenefits,
  getPalette,
  getTemplate,
  pageTemplates,
  planAllows,
  type PageContent,
} from "@/lib/pageTemplates";


interface WizardEditorProps {
  briefingData: BriefingData;
  initialContent?: PageContent;
}


const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "pagina";

const WizardEditor = ({ briefingData, initialContent }: WizardEditorProps) => {
  const { canExportHTML, canRemoveWatermark, currentPlan, canUseCustomDomain } = usePlanFeatures();
  const [selectedPalette, setSelectedPalette] = useState("Indigo");
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<PageContent>(
    initialContent ?? {
      headline: `${briefingData.transformation}`,
      subheadline: `O ${briefingData.product} ideal para ${briefingData.audience.toLowerCase()}`,
      cta: "Quero Começar Agora",
      badge: "Oferta especial",
      product: briefingData.product,
      benefits: defaultBenefits,
      testimonials: [],
      faq: [],
    }
  );

  const { user } = useAuth();
  const { toast } = useToast();

  const currentPalette = getPalette(selectedPalette);
  const template = getTemplate(selectedTemplate);

  const html = useMemo(
    () =>
      buildPageHtml(
        {
          ...generatedContent,
          product: briefingData.product,
          benefits: generatedContent.benefits?.length ? generatedContent.benefits : defaultBenefits,
        },
        selectedTemplate,
        selectedPalette,
        { watermark: !canRemoveWatermark, tier: currentPlan }
      ),
    [generatedContent, selectedTemplate, selectedPalette, canRemoveWatermark, currentPlan, briefingData.product]
  );


  const lockedToast = (plan: string) =>
    toast({
      variant: "destructive",
      title: "Recurso bloqueado",
      description: `Faça upgrade para o plano ${plan === "business" ? "Business" : "Pro"} para usar este recurso.`,
    });

  const handlePreview = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const handleExportHTML = () => {
    if (!canExportHTML) return lockedToast("pro");
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(briefingData.product)}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({ title: "HTML exportado!", description: "O download da sua página começou." });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        title: briefingData.product.slice(0, 120),
        product: briefingData.product,
        audience: briefingData.audience,
        transformation: briefingData.transformation,
        headline: generatedContent.headline,
        subheadline: generatedContent.subheadline,
        cta: generatedContent.cta,
        template: selectedTemplate,
        palette: selectedPalette,
        content: {
          badge: generatedContent.badge ?? null,
          benefits: generatedContent.benefits ?? [],
          testimonials: generatedContent.testimonials ?? [],
          faq: generatedContent.faq ?? [],
          guarantee: generatedContent.guarantee ?? null,
          urgency: generatedContent.urgency ?? null,
        } as unknown as never,
      };


      if (pageId) {
        const { error } = await supabase.from("pages").update(payload).eq("id", pageId);
        if (error) throw error;
      } else {
        const slug = `${slugify(briefingData.product)}-${Math.random().toString(36).slice(2, 7)}`;
        const { data, error } = await supabase
          .from("pages")
          .insert({ ...payload, slug })
          .select("id")
          .single();
        if (error) throw error;
        setPageId(data.id);
      }
      toast({ title: "Página salva!", description: "Suas alterações foram guardadas." });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar sua página. Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const alternatives: Record<string, string[]> = {
    headline: [
      `${briefingData.transformation} sem enrolação`,
      `${briefingData.transformation} — passo a passo`,
      `O caminho mais curto para ${briefingData.transformation.toLowerCase()}`,
    ],
    subheadline: [
      `Método aplicado por ${briefingData.audience.toLowerCase()} que queriam resultado real.`,
      `${briefingData.product} com acompanhamento e roteiro claro do início ao fim.`,
      `Feito para ${briefingData.audience.toLowerCase()} que não têm tempo a perder.`,
    ],
    cta: ["Garantir Minha Vaga", "Quero Começar Agora", "Acessar Agora", "Quero Meus Resultados"],
  };

  const pick = (field: string) => {
    const options = alternatives[field];
    return options[Math.floor(Math.random() * options.length)];
  };

  const handleRegenerate = (field: "headline" | "subheadline" | "cta") => {
    setGeneratedContent((prev) => ({ ...prev, [field]: pick(field) }));
  };

  const handleRegenerateAll = async () => {
    setRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-copy", {
        body: { ...briefingData, tone: "ousado, específico e profissional" },
      });
      if (error || !data || (data as any).error) throw error ?? new Error((data as any)?.error);
      const d = data as any;
      setGeneratedContent((prev) => ({
        ...prev,
        headline: d.headline ?? prev.headline,
        subheadline: d.subheadline ?? prev.subheadline,
        cta: d.cta ?? prev.cta,
        badge: d.badge ?? prev.badge,
        benefits: Array.isArray(d.benefits) && d.benefits.length ? d.benefits : prev.benefits,
        testimonials: Array.isArray(d.testimonials) ? d.testimonials : prev.testimonials,
        faq: Array.isArray(d.faq) ? d.faq : prev.faq,
        guarantee: d.guarantee ?? prev.guarantee,
        urgency: d.urgency ?? prev.urgency,
      }));
      toast({ title: "Copy regenerada pela IA", description: "Uma nova versão profissional foi aplicada." });
    } catch (err) {
      setGeneratedContent((prev) => ({
        ...prev,
        headline: pick("headline"),
        subheadline: pick("subheadline"),
        cta: pick("cta"),
      }));
      toast({
        title: "IA indisponível",
        description: "Aplicamos variações locais dos textos.",
      });
    } finally {
      setRegenerating(false);
    }
  };


  const handleSelectTemplate = (id: string) => {
    const t = getTemplate(id);
    if (!planAllows(currentPlan, t.requiredPlan)) return lockedToast(t.requiredPlan);
    setSelectedTemplate(id);
  };

  const handleSelectPalette = (name: string) => {
    const p = getPalette(name);
    if (!planAllows(currentPlan, p.requiredPlan)) return lockedToast(p.requiredPlan);
    setSelectedPalette(name);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* App Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary">
              <Magnet className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground hidden sm:inline">PageMagnet</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handlePreview}>
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Ver Live</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className={`gap-2 ${canExportHTML ? "" : "opacity-70"}`}
            onClick={handleExportHTML}
          >
            {canExportHTML ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span className="hidden sm:inline">Exportar HTML</span>
          </Button>

          <Button size="sm" className="gradient-primary gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">Salvar</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:relative z-40 w-72 bg-card border-r border-border h-[calc(100vh-57px)] overflow-y-auto transition-transform`}
        >
          <div className="p-4 space-y-6">
            {/* Text Editing Section */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <Type className="w-4 h-4 text-primary" />
                Editar Textos
              </h3>

              {/* Headline */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Título Principal
                </label>
                <div className="relative">
                  <textarea
                    value={generatedContent.headline}
                    onChange={(e) =>
                      setGeneratedContent((prev) => ({ ...prev, headline: e.target.value }))
                    }
                    rows={2}
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={() => handleRegenerate("headline")}
                    className="absolute right-2 top-2 p-1.5 hover:bg-muted rounded-md transition-colors"
                    title="Regenerar"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Subheadline */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Subtítulo
                </label>
                <div className="relative">
                  <textarea
                    value={generatedContent.subheadline}
                    onChange={(e) =>
                      setGeneratedContent((prev) => ({ ...prev, subheadline: e.target.value }))
                    }
                    rows={2}
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={() => handleRegenerate("subheadline")}
                    className="absolute right-2 top-2 p-1.5 hover:bg-muted rounded-md transition-colors"
                    title="Regenerar"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Botão CTA
                </label>
                <div className="relative">
                  <input
                    value={generatedContent.cta}
                    onChange={(e) =>
                      setGeneratedContent((prev) => ({ ...prev, cta: e.target.value }))
                    }
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={() => handleRegenerate("cta")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-md transition-colors"
                    title="Regenerar"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>

            {/* Templates Section */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <LayoutTemplate className="w-4 h-4 text-primary" />
                Templates
              </h3>
              <div className="space-y-2">
                {pageTemplates.map((t) => {
                  const locked = !planAllows(currentPlan, t.requiredPlan);
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTemplate(t.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedTemplate === t.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-muted-foreground"
                      } ${locked ? "opacity-70" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{t.name}</span>
                        {locked && (
                          <Badge className="text-[10px] gap-1 bg-amber-500 hover:bg-amber-500">
                            <Lock className="w-3 h-3" />
                            {t.requiredPlan === "business" ? "Business" : "Pro"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Palette Section */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <Palette className="w-4 h-4 text-primary" />
                Paleta de Cores
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {colorPalettes.map((palette) => {
                  const locked = !planAllows(currentPlan, palette.requiredPlan);
                  return (
                    <button
                      key={palette.name}
                      onClick={() => handleSelectPalette(palette.name)}
                      className={`relative p-3 rounded-lg border-2 transition-all ${
                        selectedPalette === palette.name
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-muted-foreground"
                      } ${locked ? "opacity-70" : ""}`}
                    >
                      {locked && (
                        <Lock className="w-3 h-3 absolute top-2 right-2 text-amber-500" />
                      )}
                      <div className="flex gap-1.5 mb-2">
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: palette.primary }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: palette.secondary }}
                        />
                      </div>
                      <span className="text-xs font-medium">{palette.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Regenerate All */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleRegenerateAll}
              disabled={regenerating}
            >
              {regenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {regenerating ? "Gerando com IA..." : "Regenerar com IA"}
            </Button>


            {/* Custom domain shortcut */}
            <Link to="/integracoes" className="block">
              <Button variant="ghost" className="w-full gap-2 justify-start">
                <Globe className="w-4 h-4 text-primary" />
                Domínio e API
                {!canUseCustomDomain && (
                  <Badge className="ml-auto text-[10px] bg-amber-500 hover:bg-amber-500">
                    Business
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Preview Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Preview Label */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-medium">
                Preview da Página · {template.name}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Atualizado em tempo real
              </div>
            </div>

            {/* Page Preview */}
            <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
              <iframe
                title="Preview da página"
                srcDoc={html}
                className="w-full h-[720px] border-0 bg-white"
              />
            </div>

            {/* Watermark hint */}
            {!canRemoveWatermark && (
              <div className="mt-3 text-center text-xs text-muted-foreground">
                Sua página exibe a marca d'água "Criado com PageMagnet".{" "}
                <Link to="/planos" className="text-primary hover:underline">
                  Remover marca d'água
                </Link>
              </div>
            )}

            {/* Upgrade Banner for Free Plan */}
            {currentPlan === "free" && (
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                      <Crown className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Desbloqueie todo o potencial</h4>
                      <p className="text-sm text-muted-foreground">
                        Exporte HTML, remova marca d'água e acesse templates premium.
                      </p>
                    </div>
                  </div>
                  <Link to="/planos">
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                      <Crown className="w-4 h-4" />
                      Fazer Upgrade
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default WizardEditor;
