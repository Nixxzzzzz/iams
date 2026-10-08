import React from "react";
import { AssetCondition } from "@/domain/enums";
import { cn } from "@/lib/utils";

interface ConditionBadgeProps {
  condition: AssetCondition;
  className?: string;
}

const conditionConfig: Record<
  AssetCondition,
  { label: string; dotColor: string }
> = {
  [AssetCondition.NEW]: {
    label: "New",
    dotColor: "bg-emerald-500",
  },
  [AssetCondition.EXCELLENT]: {
    label: "Excellent",
    dotColor: "bg-emerald-500",
  },
  [AssetCondition.GOOD]: {
    label: "Good",
    dotColor: "bg-blue-500",
  },
  [AssetCondition.FAIR]: {
    label: "Fair",
    dotColor: "bg-amber-500",
  },
  [AssetCondition.POOR]: {
    label: "Poor",
    dotColor: "bg-orange-500",
  },
  [AssetCondition.DAMAGED]: {
    label: "Damaged",
    dotColor: "bg-rose-500",
  },
};

export const ConditionBadge: React.FC<ConditionBadgeProps> = ({
  condition,
  className,
}) => {
  const config = conditionConfig[condition] || {
    label: condition,
    dotColor: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium",
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dotColor)} />
      {config.label}
    </span>
  );
};
