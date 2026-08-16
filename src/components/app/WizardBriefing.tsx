import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Sparkles, Package, Users, Zap } from "lucide-react";

interface WizardBriefingProps {
  onSubmit: (data: BriefingData) => void;
}

export interface BriefingData {
  product: string;
  audience: string;
  transformation: string;
}

const briefingSchema = z.object({
  product: z
    .string()
    .trim()
    .min(3, "Descreva o produto com pelo menos 3 caracteres")
    .max(200, "Máximo de 200 caracteres"),
  audience: z
    .string()
    .trim()
    .min(3, "Descreva o público com pelo menos 3 caracteres")
    .max(200, "Máximo de 200 caracteres"),
  transformation: z
    .string()
    .trim()
    .min(10, "Descreva a transformação com pelo menos 10 caracteres")
    .max(500, "Máximo de 500 caracteres"),
});

const MAX_LENGTHS: Record<keyof BriefingData, number> = {
  product: 200,
  audience: 200,
  transformation: 500,
};

const WizardBriefing = ({ onSubmit }: WizardBriefingProps) => {
  const [formData, setFormData] = useState<BriefingData>({
    product: "",
    audience: "",
    transformation: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BriefingData, string>>>({});

  const handleChange = (field: keyof BriefingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = briefingSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof BriefingData, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof BriefingData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    onSubmit(result.data as BriefingData);
  };

  const isValid = briefingSchema.safeParse(formData).success;


  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>3 perguntas simples</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Conte-nos sobre seu projeto
          </h1>
          <p className="text-muted-foreground text-lg">
            A IA vai criar uma página de vendas profissional para você.
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="bg-card rounded-2xl shadow-xl border border-border p-6 md:p-8 space-y-6">
            {/* Input 1: Product */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Package className="w-4 h-4 text-primary" />
                O que você vende?
              </label>
              <input
                type="text"
                value={formData.product}
                onChange={(e) => handleChange("product", e.target.value)}
                maxLength={MAX_LENGTHS.product}
                placeholder="Ex: Curso online de fotografia profissional"
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
              <p className="text-xs text-muted-foreground">
                Nome do produto e uma breve descrição
              </p>
              {errors.product && (
                <p className="text-xs text-destructive">{errors.product}</p>
              )}
            </div>

            {/* Input 2: Audience */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Users className="w-4 h-4 text-primary" />
                Para quem é?
              </label>
              <input
                type="text"
                value={formData.audience}
                onChange={(e) => handleChange("audience", e.target.value)}
                maxLength={MAX_LENGTHS.audience}
                placeholder="Ex: Iniciantes que querem trabalhar como fotógrafos"
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
              <p className="text-xs text-muted-foreground">
                Descreva seu público-alvo ideal
              </p>
              {errors.audience && (
                <p className="text-xs text-destructive">{errors.audience}</p>
              )}
            </div>

            {/* Input 3: Transformation */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Zap className="w-4 h-4 text-primary" />
                Qual a transformação?
              </label>
              <textarea
                value={formData.transformation}
                onChange={(e) => handleChange("transformation", e.target.value)}
                maxLength={MAX_LENGTHS.transformation}
                placeholder="Ex: Dominar técnicas profissionais e começar a ganhar dinheiro com fotografia em 60 dias"
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
              />
              <p className="text-xs text-muted-foreground">
                A promessa principal ou benefício que seu cliente terá
              </p>
              {errors.transformation && (
                <p className="text-xs text-destructive">{errors.transformation}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isValid}
              size="lg"
              className="w-full gradient-primary hover:opacity-90 transition-all shadow-glow text-lg py-6 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              Gerar Mágica
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WizardBriefing;
