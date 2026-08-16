import { Briefcase, Lightbulb, Users2 } from "lucide-react";

const audiences = [
  {
    icon: Lightbulb,
    title: "Infoprodutores",
    description: "Venda seus cursos, e-books e mentorias com páginas que transmitem autoridade e geram confiança.",
  },
  {
    icon: Briefcase,
    title: "Freelancers",
    description: "Apresente seus serviços de forma profissional e conquiste mais clientes com menos esforço.",
  },
  {
    icon: Users2,
    title: "Agências",
    description: "Entregue landing pages para seus clientes em minutos, não semanas. Escale sua operação.",
  },
];

const ForWhom = () => {
  return (
    <section id="para-quem" className="py-20 md:py-32 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Para quem é o PageMagnet?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ideal para quem precisa de páginas profissionais sem complicação.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {audiences.map((audience, index) => (
            <div
              key={index}
              className="group text-center p-8 rounded-2xl border border-border hover:border-primary/30 bg-card hover:shadow-lg transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <audience.icon className="w-10 h-10 text-primary" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {audience.title}
              </h3>
              <p className="text-muted-foreground">
                {audience.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForWhom;
