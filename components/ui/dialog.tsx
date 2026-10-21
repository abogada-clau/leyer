"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      className="w-[calc(100%-2rem)] max-h-[90dvh] overflow-y-auto max-w-2xl rounded-2xl border bg-card p-0 text-card-foreground shadow-floating backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <div className="relative p-6 sm:p-8">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Cerrar ventana"
          className="absolute right-3 top-3"
          onClick={() => onOpenChange(false)}
        >
          <X />
        </Button>
        <h2
          id={`${id}-title`}
          className="pr-8 text-xl font-semibold tracking-tight"
        >
          {title}
        </h2>
        {description && (
          <p
            id={`${id}-description`}
            className="mt-2 text-sm leading-relaxed text-muted-foreground"
          >
            {description}
          </p>
        )}
        <div className="mt-6">{children}</div>
      </div>
    </dialog>
  );
}
