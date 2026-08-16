import { Check, FileText, Layout, Rocket } from "lucide-react";

const benefits = [
  {
    icon: FileText,
    title: "Textos gerados com copywriting profissional",
    description: "IA treinada em milhares de landing pages de sucesso. Headlines, CTAs e descrições que convertem.",
  },
  {
    icon: Layout,
    title: "Layouts validados por especialistas",
    description: "Estruturas testadas e aprovadas por profissionais de marketing e UX design.",
  },
  {
    icon: Rocket,
    title: "Página pronta para publicar ou exportar",
    description: "Publique com um clique ou exporte o código HTML limpo para usar onde quiser.",
  },
];

const Benefits = () => {
  return (
    <section id="beneficios" className="py-20 md:py-32 hero-gradient">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Por que escolher o PageMagnet?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas poderosas para criar páginas que realmente convertem.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="relative p-8 rounded-2xl bg-card border border-border shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Icon Container */}
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
                <benefit.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground mb-6">
                {benefit.description}
              </p>
              
              {/* Check list */}
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Incluso em todos os planos</span>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
