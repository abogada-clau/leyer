"use client";

import type { ReactNode } from "react";
import { ChevronDown, Bell, type LucideIcon } from "lucide-react";
import { Brand } from "@/components/design-system/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminShell({
  organization,
  user,
  navigation,
  activeSection,
  onNavigate,
  onNotifications,
  children,
}: {
  organization: string;
  user: string;
  navigation: { id: string; label: string; icon: LucideIcon }[];
  activeSection: string;
  onNavigate: (id: string) => void;
  onNotifications?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Administración de ejemplo">
        <Brand />
        <div className="admin-org">
          <span>E</span>
          <div>
            <strong>{organization}</strong>
            <small>Espacio de trabajo</small>
          </div>
          <ChevronDown size={12} />
        </div>
        <p className="admin-nav-label">TU ESTUDIO</p>
        <nav>
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => onNavigate(id)}
              className={cn(activeSection === id && "is-active")}
              aria-current={activeSection === id ? "page" : undefined}
            >
              <Icon size={16} strokeWidth={1.6} />
              {label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <span className="ds-online-dot" />
          Todo está al día
        </div>
      </aside>
      <div className="admin-workspace">
        <div className="admin-topbar">
          <p>
            {organization}
            <span>/</span>
            {navigation.find((item) => item.id === activeSection)?.label}
          </p>
          <div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Ver notificaciones de ejemplo"
              onClick={onNotifications}
            >
              <Bell />
            </Button>
            <span className="admin-avatar" title={user}>
              {user
                .split(" ")
                .map((word) => word[0])
                .slice(0, 2)
                .join("")}
            </span>
          </div>
        </div>
        <div className="admin-page">{children}</div>
      </div>
    </div>
  );
}
