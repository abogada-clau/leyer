import type { ReactNode } from "react";
import { ArrowRight, Plus, Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("section-heading", className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="font-editorial">{title}</h2>
      {description && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

export function ServiceCard({
  icon: Icon,
  title,
  children,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="service-card group text-left"
    >
      <Icon
        aria-hidden="true"
        className="size-7 text-terracotta"
        strokeWidth={1.4}
      />
      <h3 className="mt-5 font-editorial text-lg font-medium leading-snug">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
      <span className="mt-5 flex items-center gap-2 text-xs font-medium">
        Conocer más{" "}
        <ArrowRight
          aria-hidden="true"
          className="size-3.5 transition-transform group-hover:translate-x-1"
        />
      </span>
    </button>
  );
}

export function FAQ({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  return (
    <div className="divide-y border-y">
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
            {item.question}
            <Plus
              aria-hidden="true"
              className="size-4 shrink-0 transition-transform group-open:rotate-45"
            />
          </summary>
          <p className="max-w-2xl pb-5 text-sm leading-relaxed text-muted-foreground">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

export function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 text-sm leading-relaxed"
        >
          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
            <Check aria-hidden="true" className="size-2.5" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-10 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
        <Icon aria-hidden="true" className="size-5" strokeWidth={1.5} />
      </span>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
