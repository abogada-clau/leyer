"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function PublicThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const selected = mounted ? theme || "system" : "system";
  const Icon = selected === "dark" ? Moon : selected === "light" ? Sun : Laptop;
  return (
    <div className="relative inline-grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent focus-within:ring-2 focus-within:ring-ring">
      <Icon size={16} aria-hidden />
      <select
        aria-label="Cambiar tema"
        title="Cambiar tema"
        className="absolute inset-0 size-full cursor-pointer opacity-0"
        disabled={!mounted}
        value={selected}
        onChange={event => setTheme(event.currentTarget.value)}
      >
        <option value="light">Claro</option>
        <option value="dark">Oscuro</option>
        <option value="system">Según el dispositivo</option>
      </select>
    </div>
  );
}
