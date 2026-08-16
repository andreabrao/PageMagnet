import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock, Crown } from "lucide-react";
import { getPlanDisplayName } from "@/hooks/usePlanFeatures";

type SubscriptionPlan = "free" | "pro" | "business";

interface LockedFeatureButtonProps {
  requiredPlan: SubscriptionPlan;
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const LockedFeatureButton = ({
  requiredPlan,
  children,
  variant = "outline",
  size = "sm",
  className = "",
}: LockedFeatureButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative inline-block">
          <Button
            variant={variant}
            size={size}
            className={`gap-2 opacity-60 cursor-not-allowed ${className}`}
            disabled
          >
            {children}
            <Lock className="w-3 h-3" />
          </Button>
          <Badge 
            className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 bg-amber-500 hover:bg-amber-500"
          >
            {getPlanDisplayName(requiredPlan)}
          </Badge>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="flex items-start gap-2">
          <Crown className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Recurso {getPlanDisplayName(requiredPlan)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Faça upgrade para o plano {getPlanDisplayName(requiredPlan)} para desbloquear este recurso.
            </p>
            <Link to="/plans" className="text-xs text-primary hover:underline mt-1 inline-block">
              Ver planos →
            </Link>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

interface UpgradeBadgeProps {
  plan: SubscriptionPlan;
  className?: string;
}

export const UpgradeBadge = ({ plan, className = "" }: UpgradeBadgeProps) => {
  return (
    <Badge 
      variant="secondary" 
      className={`text-[10px] gap-1 bg-amber-100 text-amber-700 hover:bg-amber-100 ${className}`}
    >
      <Crown className="w-3 h-3" />
      {getPlanDisplayName(plan)}
    </Badge>
  );
};
