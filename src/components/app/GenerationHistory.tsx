import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Download, Trash2, Loader2, History, Lock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import {
  buildPageHtml,
  defaultBenefits,
  getPalette,
  getTemplate,
  type PageContent,
} from "@/lib/pageTemplates";

interface PageRow {
  id: string;
  title: string;
  product: string;
  audience: string;
  transformation: string;
  headline: string;
  subheadline: string;
  cta: string;
  template: string;
  palette: string;
  created_at: string;
  updated_at: string;
  content: Record<string, unknown> | null;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "pagina";

const GenerationHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { canExportHTML, canRemoveWatermark, currentPlan } = usePlanFeatures();
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar histórico",
          description: "Não foi possível buscar suas gerações.",
        });
      } else {
        setPages((data ?? []) as unknown as PageRow[]);
      }
      setLoading(false);
    })();
  }, [user, toast]);

  const toContent = (page: PageRow): PageContent => {
    const extra = (page.content ?? {}) as any;
    return {
      headline: page.headline,
      subheadline: page.subheadline,
      cta: page.cta,
      product: page.product,
      badge: extra.badge ?? undefined,
      benefits: Array.isArray(extra.benefits) && extra.benefits.length ? extra.benefits : defaultBenefits,
      testimonials: Array.isArray(extra.testimonials) ? extra.testimonials : [],
      faq: Array.isArray(extra.faq) ? extra.faq : [],
      guarantee: extra.guarantee ?? undefined,
      urgency: extra.urgency ?? undefined,
    };
  };

  const htmlOf = (page: PageRow) =>
    buildPageHtml(toContent(page), page.template, page.palette, {
      watermark: !canRemoveWatermark,
      tier: currentPlan,
    });

  const handleView = (page: PageRow) => {
    const blob = new Blob([htmlOf(page)], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const handleExport = (page: PageRow) => {
    if (!canExportHTML) {
      toast({
        variant: "destructive",
        title: "Recurso bloqueado",
        description: "Faça upgrade para o plano Pro para exportar o HTML.",
      });
      return;
    }
    const blob = new Blob([htmlOf(page)], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(page.product)}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (page: PageRow) => {
    setDeletingId(page.id);
    const { error } = await supabase.from("pages").delete().eq("id", page.id);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir." });
    } else {
      setPages((prev) => prev.filter((p) => p.id !== page.id));
      toast({ title: "Geração excluída" });
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!pages.length) {
    return (
      <Card>
        <CardContent className="py-14 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
            <History className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Nenhuma geração salva ainda</p>
            <p className="text-sm text-muted-foreground">
              Crie uma página e clique em “Salvar” para vê-la aqui.
            </p>
          </div>
          <Link to="/app">
            <Button className="gradient-primary gap-2">
              <Sparkles className="w-4 h-4" />
              Criar nova página
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {pages.length} {pages.length === 1 ? "página salva" : "páginas salvas"} na sua conta.
      </p>

      {pages.map((page) => {
        const palette = getPalette(page.palette);
        const template = getTemplate(page.template);
        return (
          <Card key={page.id} className="overflow-hidden">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div
                className="w-full sm:w-16 h-16 rounded-xl shrink-0 flex items-center justify-center text-white font-bold"
                style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.accent ?? palette.primary})` }}
              >
                {page.product.slice(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{page.headline || page.title}</p>
                <p className="text-sm text-muted-foreground truncate">{page.subheadline}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-[11px]">{template.name}</Badge>
                  <Badge variant="outline" className="text-[11px]">{palette.name}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(page.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleView(page)}>
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Ver</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport(page)}>
                  {canExportHTML ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  <span className="hidden sm:inline">HTML</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(page)}
                  disabled={deletingId === page.id}
                >
                  {deletingId === page.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default GenerationHistory;
