import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Rocket, Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface Plan {
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

const Pricing = () => {
  return (
    <section id="precos" className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Planos para cada necessidade
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comece gratuitamente e evolua conforme sua demanda cresce.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative border-2 transition-all hover:shadow-xl ${
                plan.popular 
                  ? "border-primary shadow-lg md:scale-105" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gradient-primary text-primary-foreground shadow-glow">
                    Mais Popular
                  </Badge>
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
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
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
                  asChild
                  className={`w-full ${
                    plan.popular 
                      ? "gradient-primary hover:opacity-90 shadow-glow" 
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link to="/auth">
                    {plan.priceValue === 0 ? "Começar grátis" : "Assinar agora"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
