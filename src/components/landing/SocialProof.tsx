import { Star, Users, Timer, TrendingUp } from "lucide-react";

const stats = [
  { icon: Users, value: "+12.400", label: "páginas criadas" },
  { icon: Star, value: "4,9/5", label: "avaliação média" },
  { icon: Timer, value: "< 2 min", label: "para publicar" },
  { icon: TrendingUp, value: "+38%", label: "conversão média" },
];

const SocialProof = () => {
  return (
    <section className="border-y border-border bg-card/60 py-10">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-secondary/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground leading-none">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
