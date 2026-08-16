import { MessageSquare, Users, Zap } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Diga o que você vende",
    description: "Descreva seu produto ou serviço em poucas palavras. A IA entende o contexto.",
  },
  {
    icon: Users,
    title: "Para quem é",
    description: "Informe seu público-alvo. Personalização automática para sua audiência.",
  },
  {
    icon: Zap,
    title: "Qual transformação oferece",
    description: "Descreva o resultado. A IA cria o copy perfeito para converter.",
  },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-20 md:py-32 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como funciona
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            3 perguntas simples. Uma landing page profissional. Zero complexidade.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl card-gradient border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold shadow-glow">
                {index + 1}
              </div>
              
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
