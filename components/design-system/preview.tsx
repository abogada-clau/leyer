"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useTheme } from "next-themes";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Copy,
  FileText,
  FolderOpen,
  Grid2X2,
  HeartHandshake,
  Layers2,
  LayoutDashboard,
  Menu,
  Moon,
  MousePointer2,
  Palette,
  Plus,
  Scale,
  Search,
  Settings2,
  ShieldCheck,
  Sun,
  Type,
  UsersRound,
  X,
  Loader2,
  Ruler,
  Shapes,
  type LucideIcon,
} from "lucide-react";
import { Brand } from "@/components/design-system/brand";
import { ContextPreviews } from "@/components/design-system/context-previews";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState, FAQ } from "@/components/patterns/content";
import {
  brandColors,
  navigation,
  radii,
  spacing,
} from "@/lib/design-system/tokens";
import { cn } from "@/lib/utils";

const navIcons: Record<string, LucideIcon> = {
  overview: Grid2X2,
  colors: Palette,
  typography: Type,
  layout: Ruler,
  icons: Shapes,
  buttons: MousePointer2,
  forms: FileText,
  feedback: CircleHelp,
  patterns: LayoutDashboard,
  guidelines: BookOpen,
};

function Section({
  id,
  number,
  title,
  description,
  children,
  aside,
}: {
  id: string;
  number: string;
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section id={id} data-ds-section className="ds-section">
      <div className="ds-section-header">
        <div>
          <p className="ds-section-number">
            {number} <span>/</span>{" "}
            {id === "patterns"
              ? "EN CONTEXTO"
              : Number(number) < 5
                ? "FUNDAMENTOS"
                : "COMPONENTES"}
          </p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Specimen({
  title,
  caption,
  children,
  className,
}: {
  title: string;
  caption?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ds-specimen", className)}>
      <div className="ds-specimen-label">
        <h3>{title}</h3>
        {caption && <span>{caption}</span>}
      </div>
      <div className="ds-specimen-body">{children}</div>
    </div>
  );
}

export function DesignSystemPreview() {
  const { resolvedTheme, setTheme } = useTheme();
  const [active, setActive] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [roles, setRoles] = useState<string[]>(["admin", "lawyer"]);
  const [email, setEmail] = useState("claudia@");
  const [sent, setSent] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-100px 0px -65% 0px", threshold: 0 },
    );
    document
      .querySelectorAll("[data-ds-section]")
      .forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const closeOnDesktop = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnDesktop);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, [menuOpen]);
  async function copyColor(name: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(name);
      setNotice(`${name}: ${value} copiado al portapapeles.`);
    } catch {
      setNotice(`El color ${name} es ${value}.`);
    }
  }
  function saveDemo() {
    setSaving(true);
    setSaved(false);
    saveTimer.current = setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setNotice("Cambios guardados en esta demostración.");
    }, 800);
  }
  function submitDemo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }
  const emailInvalid =
    email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="ds-app">
      <a href="#main-content" className="ds-skip-link">
        Saltar al contenido
      </a>
      <header className="ds-topbar">
        <div className="ds-topbar-brand">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={menuOpen ? "Cerrar navegación" : "Abrir navegación"}
            aria-expanded={menuOpen}
            aria-controls="design-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
          <a href="#overview" aria-label="Leyer, inicio del sistema de diseño">
            <Brand />
          </a>
          <span className="ds-brand-divider" />
          <span className="ds-topbar-title">Design system</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="ds-version">
            <span />
            v0.1
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label="Cambiar entre tema claro y oscuro"
          >
            <Moon className="dark:hidden" />
            <Sun className="hidden dark:block" />
          </Button>
          <a href="#patterns" className="ds-context-link">
            Ver en contexto <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </header>
      {menuOpen && (
        <button
          className="ds-nav-backdrop"
          aria-label="Cerrar navegación"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        className={cn("ds-sidebar", menuOpen && "is-open")}
        id="design-navigation"
        aria-label="Navegación del sistema de diseño"
      >
        <div className="ds-sidebar-top">
          <span className="ds-sidebar-caption">LA BIBLIOTECA DE LEYER</span>
          <p>
            Todo empieza con
            <br />
            una buena base.
          </p>
        </div>
        <nav>
          {navigation.map((group) => (
            <div className="ds-nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.links.map((link) => {
                const Icon = navIcons[link.icon];
                return (
                  <a
                    href={`#${link.id}`}
                    key={link.id}
                    aria-current={active === link.id ? "location" : undefined}
                    className={cn(active === link.id && "is-active")}
                    onClick={() => {
                      setActive(link.id);
                      setMenuOpen(false);
                    }}
                  >
                    <Icon aria-hidden="true" size={16} strokeWidth={1.6} />
                    <span>{link.label}</span>
                    {active === link.id && <span className="ds-active-dot" />}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="ds-sidebar-note">
          <span className="ds-note-icon">
            <Layers2 size={17} strokeWidth={1.5} />
          </span>
          <strong>Un sistema. Muchas formas.</strong>
          <p>
            La misma esencia, desde una primera visita hasta el trabajo de cada
            día.
          </p>
          <a href="#guidelines" onClick={() => setMenuOpen(false)}>
            Nuestra filosofía <ArrowUpRight size={13} />
          </a>
        </div>
        <div className="ds-sidebar-footer">
          <span className="ds-online-dot" />
          Diseñado para evolucionar
        </div>
      </aside>
      <main id="main-content" className="ds-main">
        <div className="ds-breadcrumb">
          <span>Leyer</span>
          <ChevronRight size={12} />
          <span>Sistema de diseño</span>
          <ChevronRight size={12} />
          <span className="text-foreground">Visión general</span>
        </div>
        <section id="overview" data-ds-section className="ds-hero">
          <div className="ds-hero-copy">
            <p className="eyebrow">
              <span />
              CLARIDAD, POR DISEÑO
            </p>
            <h1>
              Un lenguaje común.
              <br />
              <em>Infinitas posibilidades.</em>
            </h1>
            <p className="ds-hero-description">
              Una base visual que conecta tu estudio con las personas.
              <br className="hidden xl:block" /> Cercana hacia afuera. Precisa
              hacia adentro.
            </p>
            <div className="ds-hero-actions">
              <Button asChild>
                <a href="#buttons">
                  Explorar componentes <ArrowRight />
                </a>
              </Button>
              <a className="ds-text-link" href="#patterns">
                Ver aplicaciones <ArrowDownRight size={15} />
              </a>
            </div>
            <div className="ds-hero-tags">
              <span>
                <span />
                Sitios web
              </span>
              <span>
                <span />
                Administración
              </span>
              <span>
                <span />
                Contenido editorial
              </span>
            </div>
          </div>
          <div
            className="ds-brand-specimen"
            aria-label="Muestra de la identidad de Leyer"
          >
            <div className="ds-specimen-cross top-left" />
            <div className="ds-specimen-cross bottom-right" />
            <div className="ds-brand-specimen-top">
              <span>LEYER / VISUAL LANGUAGE</span>
              <span>01—26</span>
            </div>
            <span className="ds-big-aa">
              Aa<span>.</span>
            </span>
            <div className="ds-brand-specimen-bottom">
              <span>
                Humano.
                <br />
                Por naturaleza.
              </span>
              <svg
                viewBox="0 0 52 52"
                width="52"
                height="52"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="26"
                  cy="26"
                  r="24"
                  stroke="currentColor"
                  strokeOpacity=".4"
                />
                <path
                  d="M14 38V14l24 24V14M14 26h24"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </div>
            <div className="ds-specimen-sticker">
              <Scale size={20} strokeWidth={1.3} />
              <span>
                EQUILIBRIO
                <br />& CARÁCTER
              </span>
            </div>
          </div>
        </section>
        <div className="ds-principles-strip">
          <p>
            <ShieldCheck size={16} />
            Consistente por principio
          </p>
          <p>
            <HeartHandshake size={16} />
            Cercano en cada detalle
          </p>
          <p>
            <MousePointer2 size={16} />
            Claro en cada interacción
          </p>
          <span>
            LA ESENCIA DEL SISTEMA <ArrowDownRight size={14} />
          </span>
        </div>

        <Section
          id="colors"
          number="01"
          title="Una paleta con intención."
          description="Naturaleza, calidez y el contraste justo. Cada color tiene una función."
          aside={
            <span className="ds-section-hint">
              <Copy size={13} />
              Haz clic para copiar
            </span>
          }
        >
          <div className="ds-color-grid">
            {brandColors.map((color, index) => (
              <button
                type="button"
                key={color.name}
                className="ds-color-card group"
                onClick={() => copyColor(color.name, color.value)}
                aria-label={`Copiar ${color.name}, ${color.value}`}
              >
                <span
                  className="ds-color-swatch"
                  style={{
                    background: `hsl(var(${color.token}))`,
                    color: color.dark
                      ? "hsl(var(--brand-ivory))"
                      : "hsl(var(--brand-ink))",
                  }}
                >
                  <span>0{index + 1}</span>
                  <span>
                    {copied === color.name ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={15} />
                    )}
                  </span>
                </span>
                <span className="ds-color-info">
                  <strong>{color.name}</strong>
                  <span>{color.value}</span>
                  <small>{color.use}</small>
                </span>
              </button>
            ))}
          </div>
          <div className="ds-semantic-line">
            <span>El color también comunica</span>
            <Badge variant="success">
              <span className="ds-status-dot" />
              Éxito
            </Badge>
            <Badge variant="warning">
              <span className="ds-status-dot" />
              Advertencia
            </Badge>
            <Badge variant="info">
              <span className="ds-status-dot" />
              Información
            </Badge>
            <Badge variant="destructive">
              <span className="ds-status-dot" />
              Error
            </Badge>
            <p>Siempre acompañado de texto o un icono.</p>
          </div>
        </Section>
        <Section
          id="typography"
          number="02"
          title="Carácter y claridad, en diálogo."
          description="Una voz editorial para inspirar confianza. Una voz funcional para hacer las cosas simples."
        >
          <div className="ds-type-grid">
            <div className="ds-editorial-type">
              <div className="ds-type-top">
                <span>LA VOZ EDITORIAL</span>
                <ArrowUpRight size={17} />
              </div>
              <p className="ds-type-family">Instrument Serif</p>
              <p className="ds-type-example">
                Las palabras
                <br />
                también <em>acercan.</em>
              </p>
              <div className="ds-type-bottom">
                <span>Regular · Italic</span>
                <span>Homes / Landings / Blog</span>
              </div>
            </div>
            <div className="ds-functional-type">
              <div className="ds-type-top">
                <span>LA VOZ FUNCIONAL</span>
                <span className="text-xs">Aa Bb Cc 0123</span>
              </div>
              <p className="ds-type-family">Geist Sans</p>
              <div className="ds-type-scale">
                <div>
                  <span>24 / 600</span>
                  <p className="text-2xl font-semibold tracking-tight">
                    Todo en su lugar.
                  </p>
                </div>
                <div>
                  <span>16 / 500</span>
                  <p className="text-base font-medium">
                    Un espacio para trabajar mejor.
                  </p>
                </div>
                <div>
                  <span>14 / 400</span>
                  <p className="text-sm text-muted-foreground">
                    Información clara. Acciones que se entienden.
                  </p>
                </div>
                <div>
                  <span>12 / 500</span>
                  <p className="text-xs font-medium">
                    Los pequeños detalles hacen la diferencia.
                  </p>
                </div>
              </div>
              <div className="ds-type-bottom">
                <span>Regular · Medium · Semibold</span>
                <span>Interfaz / Lectura / Datos</span>
              </div>
            </div>
          </div>
        </Section>
        <Section
          id="layout"
          number="03"
          title="Espacio para respirar."
          description="Un ritmo de 4 píxeles. Jerarquías claras y formas suaves, sin perder precisión."
        >
          <div className="ds-layout-grid">
            <Specimen title="Escala de espaciado" caption="BASE 4 PX">
              <div className="ds-spacing-scale">
                {spacing.map((space) => (
                  <div key={space}>
                    <span style={{ height: space }} />
                    <strong>{space}</strong>
                  </div>
                ))}
              </div>
              <p className="ds-caption">
                4–12 para detalles · 16–24 entre elementos · 32–64 entre
                secciones.
              </p>
            </Specimen>
            <Specimen
              title="Bordes y superficies"
              caption="SUTIL, NO INVISIBLE"
            >
              <div className="ds-radius-grid">
                {radii.map((radius) => (
                  <div key={radius.value}>
                    <span style={{ borderRadius: radius.value }} />
                    <strong>{radius.value} px</strong>
                    <small>{radius.name}</small>
                  </div>
                ))}
              </div>
            </Specimen>
          </div>
        </Section>
        <Section
          id="icons"
          number="04"
          title="Menos ruido. Más significado."
          description="Iconos de línea, de una misma familia. Acompañan las acciones, no las reemplazan."
          aside={
            <span className="ds-token-label">Lucide · 1.5 px · 20 px</span>
          }
        >
          <div className="ds-icon-grid">
            {[
              [LayoutDashboard, "Inicio"],
              [FileText, "Contenido"],
              [UsersRound, "Equipo"],
              [FolderOpen, "Archivos"],
              [Scale, "Legal"],
              [ShieldCheck, "Seguridad"],
              [Search, "Buscar"],
              [Settings2, "Ajustes"],
              [HeartHandshake, "Cercanía"],
              [CircleHelp, "Ayuda"],
            ].map(([Icon, label]) => {
              const Symbol = Icon as LucideIcon;
              return (
                <div key={label as string}>
                  <Symbol aria-hidden="true" size={22} strokeWidth={1.5} />
                  <span>{label as string}</span>
                </div>
              );
            })}
          </div>
        </Section>
        <Section
          id="buttons"
          number="05"
          title="Cada acción, en su punto."
          description="Una acción principal por contexto. Las secundarias acompañan, sin competir."
        >
          <div className="ds-button-grid">
            <Specimen title="Jerarquía de acciones" caption="BOTONES">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() =>
                    setNotice("Esta es la acción principal de ejemplo.")
                  }
                >
                  Acción principal <ArrowRight />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setNotice("Acción secundaria seleccionada.")}
                >
                  Secundario
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setNotice("Acción complementaria seleccionada.")
                  }
                >
                  Complementario <ArrowUpRight />
                </Button>
                <Button
                  variant="terracotta"
                  onClick={() =>
                    setNotice(
                      "El acento terracota destaca una acción editorial.",
                    )
                  }
                >
                  Acento editorial <ArrowRight />
                </Button>
              </div>
              <p className="ds-caption">
                Verde para resolver. Terracota para destacar un momento
                editorial.
              </p>
            </Specimen>
            <Specimen title="El sistema responde" caption="ESTADOS">
              <div className="flex flex-wrap items-center gap-3">
                <Button disabled={saving} onClick={saveDemo}>
                  {saving ? (
                    <Loader2 className="animate-spin" />
                  ) : saved ? (
                    <Check />
                  ) : (
                    <Plus />
                  )}
                  {saving
                    ? "Guardando…"
                    : saved
                      ? "Guardado"
                      : "Guardar cambios"}
                </Button>
                <Button disabled>Deshabilitado</Button>
                <Button
                  variant="destructive"
                  onClick={() => setConfirmOpen(true)}
                >
                  Eliminar
                </Button>
              </div>
              <p className="ds-caption">
                Prueba guardar o eliminar. El resultado se comunica de forma
                visible.
              </p>
            </Specimen>
          </div>
          <div className="ds-size-strip">
            <span>Una escala para cada contexto</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setNotice("Botón compacto: 32 px, para interfaces densas.")
              }
            >
              Compacto
            </Button>
            <Button
              variant="outline"
              onClick={() => setNotice("Botón base: 40 px, para el panel.")}
            >
              Base <ArrowRight />
            </Button>
            <Button
              size="lg"
              onClick={() =>
                setNotice("Botón amplio: 48 px, para el sitio público.")
              }
            >
              Agendar una consulta <ArrowUpRight />
            </Button>
            <span className="ds-caption">32 · 40 · 48 px</span>
          </div>
        </Section>
        <Section
          id="forms"
          number="06"
          title="Guiar, sin hacer pensar de más."
          description="Etiquetas visibles, mensajes específicos y una validación que ayuda a continuar."
        >
          <div className="ds-form-grid">
            <Specimen title="Información básica" caption="CAMPOS Y VALIDACIÓN">
              <form onSubmit={submitDemo} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="demo-name">Nombre del estudio</Label>
                  <Input
                    id="demo-name"
                    name="name"
                    placeholder="Ej. Estudio Albar"
                    required
                  />
                  <p className="ds-field-hint">
                    Así aparecerá en tu sitio público.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demo-email">Correo de contacto</Label>
                  <Input
                    id="demo-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={emailInvalid}
                    aria-describedby="demo-email-help"
                    required
                  />
                  <p
                    id="demo-email-help"
                    className={cn(
                      "ds-field-hint",
                      emailInvalid && "text-destructive",
                    )}
                  >
                    {emailInvalid
                      ? "Escribe un correo completo, por ejemplo nombre@estudio.cl."
                      : "Un correo donde tus clientes puedan encontrarte."}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="demo-type">Tipo de contenido</Label>
                    <Select id="demo-type" name="type">
                      <option>Landing de servicio</option>
                      <option>Artículo del blog</option>
                      <option>Página institucional</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-code">Identificador</Label>
                    <Input
                      id="demo-code"
                      value="Generado al guardar"
                      disabled
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Validar formulario <ArrowRight />
                </Button>
                {sent && (
                  <Alert variant="success" title="Todo en orden">
                    Este formulario es una demostración y no envía datos.
                  </Alert>
                )}
              </form>
            </Specimen>
            <div className="space-y-5">
              <Specimen title="Decisiones claras" caption="SELECCIÓN MÚLTIPLE">
                <fieldset>
                  <legend className="mb-3 text-sm font-medium">
                    Roles del usuario
                  </legend>
                  <div className="space-y-3">
                    {[
                      {
                        key: "super_admin",
                        name: "Superadministrador",
                        detail: "Administración global",
                      },
                      {
                        key: "admin",
                        name: "Administrador",
                        detail: "Contenido del estudio",
                      },
                      {
                        key: "lawyer",
                        name: "Abogado",
                        detail: "Trabajo jurídico",
                      },
                    ].map((role) => (
                      <label className="ds-role-option" key={role.key}>
                        <Checkbox
                          checked={roles.includes(role.key)}
                          onCheckedChange={(checked) =>
                            setRoles(
                              checked
                                ? [...roles, role.key]
                                : roles.filter((item) => item !== role.key),
                            )
                          }
                        />
                        <span>
                          <strong>{role.name}</strong>
                          <small>{role.detail}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="ds-field-hint mt-4" aria-live="polite">
                    {roles.length
                      ? `${roles.length} de 3 roles seleccionados.`
                      : "Sin roles asignados. Sin acceso a funciones internas."}
                  </p>
                </fieldset>
              </Specimen>
              <Specimen title="Un poco de contexto" caption="TEXTO LARGO">
                <Label htmlFor="demo-description">Descripción</Label>
                <Textarea
                  id="demo-description"
                  placeholder="Cuéntales a las personas cómo puedes acompañarlas…"
                  className="mt-2"
                />
                <p className="ds-field-hint mt-2">
                  Simple, directo y con tus propias palabras.
                </p>
              </Specimen>
            </div>
          </div>
        </Section>
        <Section
          id="feedback"
          number="07"
          title="Siempre sabes dónde estás."
          description="El estado de cada contenido y el resultado de cada acción, a primera vista."
        >
          <div className="ds-feedback-grid">
            <Specimen title="Estados de contenido" caption="ETIQUETAS">
              <div className="flex flex-wrap gap-2">
                <Badge variant="neutral">
                  <span className="ds-status-dot" />
                  Borrador
                </Badge>
                <Badge variant="warning">
                  <span className="ds-status-dot" />
                  En revisión
                </Badge>
                <Badge variant="info">
                  <span className="ds-status-dot" />
                  Programado
                </Badge>
                <Badge variant="success">
                  <span className="ds-status-dot" />
                  Publicado
                </Badge>
              </div>
              <div className="mt-6 space-y-3">
                <Alert variant="success" title="Cambios publicados">
                  Tu contenido ya está disponible en el sitio.
                </Alert>
                <Alert variant="warning" title="Hay cambios sin publicar">
                  Puedes seguir editando. Tu versión pública sigue disponible.
                </Alert>
              </div>
            </Specimen>
            <Specimen
              title="También cuando aún no hay nada"
              caption="ESTADOS VACÍOS"
            >
              <EmptyState
                icon={FolderOpen}
                title="Tu biblioteca empieza aquí"
                description="Un lugar para organizar las imágenes y archivos de tu sitio."
                action={
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setNotice(
                        "La biblioteca interactiva está en el ejemplo del panel, más abajo.",
                      )
                    }
                  >
                    <Plus />
                    Agregar el primer archivo
                  </Button>
                }
              />
            </Specimen>
          </div>
          <div className="ds-faq-demo">
            <FAQ
              items={[
                {
                  question: "¿Cuándo usar un diálogo de confirmación?",
                  answer:
                    "Cuando una acción elimina información o es difícil de deshacer. Explica qué va a pasar y nombra la acción con un verbo concreto.",
                },
                {
                  question: "¿Cómo se comunica un error?",
                  answer:
                    "Junto al campo o la acción que lo produjo. Combina texto e iconografía; el color por sí solo no es suficiente.",
                },
              ]}
            />
          </div>
        </Section>
        <Section
          id="patterns"
          number="08"
          title="La misma esencia. Distintos mundos."
          description="Así conviven los componentes: expresivos en el sitio, precisos en la administración."
          aside={<Badge variant="outline">Ejemplos interactivos</Badge>}
        >
          <ContextPreviews notify={setNotice} />
        </Section>
        <section id="guidelines" data-ds-section className="ds-guidelines">
          <div>
            <p className="eyebrow">EL CRITERIO DETRÁS DE CADA PÍXEL</p>
            <h2>
              Coherencia que se siente.
              <br />
              <em>No que se impone.</em>
            </h2>
          </div>
          <div className="ds-guideline-items">
            {[
              [
                "01",
                "Diseña con intención",
                "Cada elemento debe ayudar a leer, decidir o actuar. Si no aporta, deja espacio.",
              ],
              [
                "02",
                "Una voz, dos ritmos",
                "Editorial y pausado para las personas. Directo y funcional para el equipo.",
              ],
              [
                "03",
                "Incluye desde el inicio",
                "Buen contraste, foco visible, etiquetas claras y experiencias que también funcionan con teclado.",
              ],
            ].map(([number, title, body]) => (
              <div key={number}>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <footer className="ds-footer">
          <Brand />
          <p>Una base sólida para lo que viene.</p>
          <a href="#overview">
            Volver al inicio <ArrowUpRight size={14} />
          </a>
        </footer>
      </main>
      {notice && (
        <div role="status" className="ds-toast">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Cerrar mensaje"
            onClick={() => setNotice("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      <Dialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Eliminar este contenido?"
        description="Este ejemplo muestra cómo confirmar una acción importante. No se eliminará ningún dato real."
      >
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setConfirmOpen(false);
              setNotice("Eliminación confirmada en la demostración.");
            }}
          >
            Eliminar contenido
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
