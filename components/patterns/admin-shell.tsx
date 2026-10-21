"use client";

import Link from "next/link";
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
  production = false,
  workspaceControls,
  userControls,
  breadcrumbs,
}: {
  organization: string;
  user: string;
  navigation: { id: string; label: string; icon: LucideIcon; href?: string }[];
  activeSection: string;
  onNavigate?: (id: string) => void;
  onNotifications?: () => void;
  children: ReactNode;
  production?: boolean;
  workspaceControls?: ReactNode;
  userControls?: ReactNode;
  breadcrumbs?: ReactNode;
}) {
  return (
    <div className={cn("admin-shell", production && "admin-production")}>
      <aside
        className="admin-sidebar"
        aria-label={
          production ? "Administración de Leyer" : "Administración de ejemplo"
        }
      >
        <Brand />
        {workspaceControls || (
          <div className="admin-org">
            <span>E</span>
            <div>
              <strong>{organization}</strong>
              <small>Espacio de trabajo</small>
            </div>
            <ChevronDown size={12} />
          </div>
        )}
        <p className="admin-nav-label">TU ESTUDIO</p>
        <nav>
          {navigation.map(({ id, label, icon: Icon, href }) =>
            href ? (
              <Link
                key={id}
                href={href}
                className={cn(activeSection === id && "is-active")}
                aria-current={activeSection === id ? "page" : undefined}
              >
                <Icon aria-hidden="true" size={18} strokeWidth={1.6} />
                {label}
              </Link>
            ) : (
              <button
                type="button"
                key={id}
                onClick={() => onNavigate?.(id)}
                className={cn(activeSection === id && "is-active")}
                aria-current={activeSection === id ? "page" : undefined}
              >
                <Icon aria-hidden="true" size={16} strokeWidth={1.6} />
                {label}
              </button>
            ),
          )}
        </nav>
        <div className="admin-sidebar-bottom">
          {production ? (
            "Administración · Leyer"
          ) : (
            <>
              <span className="ds-online-dot" />
              Todo está al día
            </>
          )}
        </div>
      </aside>
      <div className="admin-workspace">
        <div className="admin-topbar">
          {breadcrumbs || (
            <p>
              {organization}
              <span>/</span>
              {navigation.find((item) => item.id === activeSection)?.label}
            </p>
          )}
          <div>
            {userControls || (
              <>
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
              </>
            )}
          </div>
        </div>
        <div className="admin-page">{children}</div>
      </div>
    </div>
  );
}
