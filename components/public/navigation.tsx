"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
export type NavNode = {
  id: string;
  label: string;
  href: string | null;
  children: NavNode[];
};
function Tree({ nodes, depth = 0 }: { nodes: NavNode[]; depth?: number }) {
  const pathname = usePathname();
  const prefix = useId();
  const [openId, setOpenId] = useState<string | null>(null);
  if (depth > 8) return null;
  return (
    <ul onPointerLeave={(event) => { if (event.pointerType === "mouse") setOpenId(null); }}>
      {nodes.map((n) => {
        const open = n.id === openId;
        const panelId = `${prefix}-${n.id}`;
        return (
          <li key={n.id}
            onPointerEnter={(event) => { if (event.pointerType === "mouse") setOpenId(n.children.length ? n.id : null); }}
            onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null) && open) setOpenId(null); }}
            onKeyDown={(event) => {
              if (event.key === "Escape" && open) {
                event.preventDefault();
                event.stopPropagation();
                setOpenId(null);
                event.currentTarget.querySelector<HTMLButtonElement>(":scope > .public-nav-trigger > button")?.focus();
              }
            }}
          >
            <div className="public-nav-trigger">
              {n.href ? <Link href={n.href} aria-current={pathname === n.href ? "page" : undefined}>{n.label}</Link> : <span>{n.label}</span>}
              {n.children.length > 0 && <button type="button" aria-label={`Subáreas de ${n.label}`} aria-expanded={open} aria-controls={panelId}
                onClick={() => setOpenId(open ? null : n.id)}><Plus size={13} aria-hidden /></button>}
            </div>
            {n.children.length > 0 && open && <div id={panelId} className="public-nav-submenu"><Tree nodes={n.children} depth={depth + 1} /></div>}
          </li>
        );
      })}
    </ul>
  );
}
export function PublicNavigation({
  nodes,
  children,
}: {
  nodes: NavNode[];
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const path = usePathname();
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [path]);
  return (
    <>
      <nav aria-label="Navegación principal" className="public-desktop-nav">
        <Tree key={path} nodes={nodes} />
      </nav>
      <details
        className="public-mobile-nav"
        ref={ref}
        onKeyDown={(e) => {
          if (e.key === "Escape" && ref.current?.open) {
            e.preventDefault();
            ref.current.open = false;
            ref.current.querySelector("summary")?.focus();
          }
        }}
      >
        <summary aria-label="Abrir menú de navegación">
          <Menu size={22} />
          <span>Menú</span>
        </summary>
        <nav
          aria-label="Navegación móvil"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a") && ref.current)
              ref.current.open = false;
          }}
        >
          <Tree key={path} nodes={nodes} />
          {children}
        </nav>
      </details>
    </>
  );
}
