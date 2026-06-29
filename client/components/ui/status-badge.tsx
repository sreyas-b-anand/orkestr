import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "approved" | "rejected" | "pending" | string;

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusConfig = {
  approved: {
    icon: CheckCircle2,
    label: "Approved",
    classes:
      "bg-[var(--status-approved-bg)] text-[var(--status-approved-text)] border-[var(--status-approved-border)]",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    classes:
      "bg-[var(--status-rejected-bg)] text-[var(--status-rejected-text)] border-[var(--status-rejected-border)]",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    classes:
      "bg-[var(--status-pending-bg)] text-[var(--status-pending-text)] border-[var(--status-pending-border)]",
  },
};

const sizeClasses = {
  sm: "text-[11px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-2",
};

const iconSizes = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4",
};

export function StatusBadge({
  status,
  size = "md",
  className,
}: StatusBadgeProps) {
  const key = status?.toLowerCase() as keyof typeof statusConfig;
  const config = statusConfig[key] ?? statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold border rounded-full uppercase tracking-wide",
        config.classes,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
}
