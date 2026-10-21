import type { ReactNode } from "react";
import { CheckCircle2, Info, AlertTriangle, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const styles = {
  success: {
    icon: CheckCircle2,
    className: "border-success/15 bg-success-soft text-success",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-warning/15 bg-warning-soft text-warning",
  },
  info: { icon: Info, className: "border-info/15 bg-info-soft text-info" },
  error: {
    icon: CircleAlert,
    className: "border-destructive/15 bg-danger-soft text-destructive",
  },
};

export function Alert({
  variant = "info",
  title,
  children,
  className,
}: {
  variant?: keyof typeof styles;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  const { icon: Icon, className: color } = styles[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 text-sm",
        color,
        className,
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="font-medium">{title}</p>
        {children && (
          <div className="mt-1 text-xs leading-relaxed opacity-90">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
