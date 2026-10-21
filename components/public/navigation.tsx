"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
export type NavNode = {
  id: string;
  label: string;
  href: string | null;
  children: NavNode[];
};
function Tree({ nodes, depth = 0 }: { nodes: NavNode[]; depth?: number }) {
  const pathname = usePathname();
  if (depth > 8) return null;
  return (
    <ul>
      {nodes.map((n) => (
        <li key={n.id}>
          {n.children.length ? (
            <details>
              <summary>
                {n.label}
                <Plus size={13} aria-hidden />
              </summary>
              <div>
                {n.href && (
                  <Link href={n.href}>Ver {n.label.toLocaleLowerCase()}</Link>
                )}
                <Tree nodes={n.children} depth={depth + 1} />
              </div>
            </details>
          ) : n.href ? (
            <Link
              href={n.href}
              aria-current={pathname === n.href ? "page" : undefined}
            >
              {n.label}
            </Link>
          ) : null}
        </li>
      ))}
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
        <Tree nodes={nodes} />
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
          <Tree nodes={nodes} />
          {children}
        </nav>
      </details>
    </>
  );
}
