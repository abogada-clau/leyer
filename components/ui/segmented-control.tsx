"use client";

import { useId, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

/** A radio group for mutually exclusive views, with native radio keyboard behavior. */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  label: string;
  className?: string;
}) {
  const name = useId();
  const group = useRef<HTMLDivElement>(null);
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = options.findIndex((option) => option.value === value);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? options.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + options.length) %
            options.length;
    onChange(options[next].value);
    group.current?.querySelectorAll<HTMLInputElement>("input")[next]?.focus();
  }
  return (
    <div
      ref={group}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex max-w-full gap-1 rounded-lg border border-border/70 bg-muted p-1",
        className,
      )}
    >
      {options.map((option) => (
        <label key={option.value} className="relative min-w-0 cursor-pointer">
          <input
            className="peer sr-only"
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="block whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium text-muted-foreground transition peer-checked:bg-card peer-checked:text-foreground peer-checked:shadow-soft peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
