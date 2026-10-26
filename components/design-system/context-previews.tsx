"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CircleHelp,
  Clock3,
  FileText,
  FolderOpen,
  HeartHandshake,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  UsersRound,
  Scale,
  CalendarDays,
  Eye,
  Trash2,
} from "lucide-react";
import { Brand, LegalIllustration } from "@/components/design-system/brand";
import { AdminShell } from "@/components/patterns/admin-shell";
import {
  Checklist,
  EmptyState,
  FAQ,
  SectionHeading,
  ServiceCard,
} from "@/components/patterns/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ImageUploader } from "@/components/ui/image-uploader";
import { DataTable, type TableColumn } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SitePage = "home" | "landing" | "blog";
type ContentRow = {
  id: string;
  title: string;
  type: string;
  status: "Publicado" | "Borrador" | "En revisión" | "Programado";
  date: string;
};
const initialRows: ContentRow[] = [
  {
    id: "1",
    title: "Un nuevo comienzo",
    type: "Landing",
    status: "Publicado",
    date: "Hoy, 10:30",
  },
  {
    id: "2",
    title: "Tu primera consulta jurídica",
    type: "Artículo",
    status: "Borrador",
    date: "Hoy, 09:15",
  },
  {
    id: "3",
    title: "Conoce nuestro estudio",
    type: "Página",
    status: "Publicado",
    date: "Ayer, 16:40",
  },
  {
    id: "4",
    title: "Acompañamiento para empresas",
    type: "Landing",
    status: "En revisión",
    date: "Ayer, 14:20",
  },
  {
    id: "5",
    title: "Cómo organizar tus antecedentes",
    type: "Artículo",
    status: "Programado",
    date: "Ayer, 11:00",
  },
];
const statusVariants = {
  Publicado: "success",
  Borrador: "neutral",
  "En revisión": "warning",
  Programado: "info",
} as const;

export function ContextPreviews({
  notify,
}: {
  notify: (message: string) => void;
}) {
  const [world, setWorld] = useState<"site" | "admin">("site");
  const [sitePage, setSitePage] = useState<SitePage>("home");
  return (
    <div className="context-preview">
      <div className="context-toolbar">
        <SegmentedControl
          value={world}
          onChange={setWorld}
          label="Experiencia de ejemplo"
          options={[
            { value: "site", label: "Sitio público" },
            { value: "admin", label: "Panel de administración" },
          ]}
        />
        {world === "site" ? (
          <SegmentedControl
            value={sitePage}
            onChange={setSitePage}
            label="Página de ejemplo"
            className="context-page-switch"
            options={[
              { value: "home", label: "Home" },
              { value: "landing", label: "Landing" },
              { value: "blog", label: "Blog" },
            ]}
          />
        ) : (
          <span className="context-demo-label">
            <span />
            Datos de demostración
          </span>
        )}
      </div>
      <div className="context-browser">
        <div className="context-browser-bar">
          <div aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p>
            <ShieldCheck size={11} />
            {world === "site"
              ? `estudio.ejemplo/${sitePage === "home" ? "" : sitePage === "landing" ? "personas/familia" : "blog"}`
              : "leyer.ejemplo/admin"}
          </p>
          <span>PREVIEW</span>
        </div>
        {world === "site" ? (
          <MarketingPreview
            page={sitePage}
            onPageChange={setSitePage}
            notify={notify}
          />
        ) : (
          <AdministrationPreview notify={notify} />
        )}
      </div>
      <p className="context-caption">
        <CircleHelp size={12} />
        Ejemplos de diseño con contenido ilustrativo. Las interacciones no
        modifican datos reales.
      </p>
    </div>
  );
}

function MarketingPreview({
  page,
  onPageChange,
  notify,
}: {
  page: SitePage;
  onPageChange: (page: SitePage) => void;
  notify: (message: string) => void;
}) {
  const [consultation, setConsultation] = useState(false);
  const [article, setArticle] = useState<string | null>(null);
  function consultationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConsultation(false);
    notify(
      "Formulario completado. Esta demostración no envía solicitudes ni guarda datos.",
    );
  }
  return (
    <div className="marketing-preview">
      <div className="marketing-navbar">
        <button
          type="button"
          onClick={() => {
            setArticle(null);
            onPageChange("home");
          }}
          aria-label="Ir a la home del ejemplo"
        >
          <Brand />
          <span>ESTUDIO JURÍDICO</span>
        </button>
        <nav aria-label="Sitio público de ejemplo">
          <button
            onClick={() => {
              setArticle(null);
              onPageChange("landing");
            }}
          >
            Personas
          </button>
          <button
            onClick={() => {
              setArticle(null);
              onPageChange("landing");
            }}
          >
            Empresas
          </button>
          <button
            onClick={() => {
              setArticle(null);
              onPageChange("blog");
            }}
          >
            Blog
          </button>
        </nav>
        <Button size="sm" onClick={() => setConsultation(true)}>
          Conversemos <ArrowUpRight />
        </Button>
      </div>
      {page === "home" && (
        <>
          <div className="marketing-hero">
            <div>
              <p className="eyebrow">CERCA DE TI. EN CADA DECISIÓN.</p>
              <h3>
                El próximo paso,
                <br />
                <em>con más claridad.</em>
              </h3>
              <p>
                Hay decisiones que cambian tu historia. Te acompañamos a
                entender tus opciones y avanzar con confianza.
              </p>
              <Button onClick={() => onPageChange("landing")}>
                Conoce cómo podemos ayudarte <ArrowRight />
              </Button>
              <span className="marketing-hero-note">
                <span />
                Asesoría cercana, desde la primera conversación.
              </span>
            </div>
            <LegalIllustration />
          </div>
          <div className="marketing-services">
            <ServiceCard
              icon={HeartHandshake}
              title="Para las personas"
              onClick={() => onPageChange("landing")}
            >
              Tu familia, tus proyectos y lo que más te importa.
            </ServiceCard>
            <ServiceCard
              icon={Scale}
              title="Para tu empresa"
              onClick={() => onPageChange("landing")}
            >
              Decisiones de negocio con una mirada jurídica clara.
            </ServiceCard>
            <ServiceCard
              icon={BookOpen}
              title="Para informarte"
              onClick={() => onPageChange("blog")}
            >
              Ideas y guías para llegar con mejores preguntas.
            </ServiceCard>
          </div>
        </>
      )}
      {page === "landing" && (
        <>
          <div className="marketing-hero marketing-hero-service">
            <div>
              <p className="eyebrow">PERSONAS / DERECHO DE FAMILIA</p>
              <h3>
                Un nuevo comienzo.
                <br />
                <em>A tu manera.</em>
              </h3>
              <p>
                Cada historia es distinta. El primer paso es escucharte y
                entender qué necesitas para seguir adelante.
              </p>
              <Button onClick={() => setConsultation(true)}>
                Agenda una conversación <ArrowRight />
              </Button>
            </div>
            <LegalIllustration />
          </div>
          <div className="marketing-split">
            <SectionHeading
              eyebrow="UN PROCESO QUE EMPIEZA CONTIGO"
              title="Primero escuchamos. Después, trazamos el camino."
            />
            <Checklist
              items={[
                "Una conversación para entender tu situación.",
                "Información clara sobre los siguientes pasos.",
                "Un acompañamiento cercano durante el proceso.",
              ]}
            />
          </div>
          <div className="marketing-faq">
            <SectionHeading
              eyebrow="PREGUNTAS FRECUENTES"
              title="Las primeras respuestas."
            />
            <FAQ
              items={[
                {
                  question: "¿Cómo preparo nuestra primera conversación?",
                  answer:
                    "Anota lo que te gustaría conversar y reúne los antecedentes que consideres relevantes. En esta página mostramos contenido de ejemplo para revisar el diseño.",
                },
                {
                  question: "¿Cómo puedo coordinar una reunión?",
                  answer:
                    "Usa el botón de contacto para ver el formulario de ejemplo. La demostración no envía solicitudes.",
                },
              ]}
            />
          </div>
        </>
      )}
      {page === "blog" &&
        (article ? (
          <article className="marketing-article">
            <button className="ds-text-link" onClick={() => setArticle(null)}>
              <ArrowLeft size={14} />
              Volver al blog
            </button>
            <p className="eyebrow mt-7">GUÍAS / CONTENIDO DE EJEMPLO</p>
            <h3>{article}</h3>
            <p className="marketing-article-lead">
              Una buena conversación empieza mucho antes de sentarse a
              conversar.
            </p>
            <div className="marketing-byline">
              <span className="admin-avatar">EE</span>
              <span>
                Equipo editorial<small>Lectura de ejemplo · 4 minutos</small>
              </span>
            </div>
            <h4>Un lugar para tus preguntas.</h4>
            <p>
              La primera reunión es una oportunidad para compartir tu historia,
              ordenar tus ideas y conocer a quienes te acompañarán. No necesitas
              tener todas las respuestas.
            </p>
            <p>
              Una lista breve con los temas que quieres abordar puede ayudarte a
              aprovechar mejor la conversación. La claridad también se construye
              paso a paso.
            </p>
            <Checklist
              items={[
                "Anota las preguntas que te gustaría resolver.",
                "Ordena los antecedentes que quieres compartir.",
                "Reserva un momento tranquilo para conversar.",
              ]}
            />
            <div className="marketing-article-note">
              Este artículo es contenido ilustrativo para el sistema de diseño.
            </div>
          </article>
        ) : (
          <div className="marketing-blog">
            <SectionHeading
              eyebrow="IDEAS PARA ENTENDER MEJOR"
              title="Información que acerca."
              description="Lecturas claras para tus preguntas de cada día."
            />
            <div className="marketing-article-grid">
              {[
                {
                  title: "Cómo prepararte para tu primera consulta",
                  category: "Guías",
                  icon: BookOpen,
                  className: "article-art-sage",
                },
                {
                  title: "Ordenar tus antecedentes, paso a paso",
                  category: "Herramientas",
                  icon: FolderOpen,
                  className: "article-art-sand",
                },
                {
                  title: "Una forma más cercana de acompañarte",
                  category: "El estudio",
                  icon: HeartHandshake,
                  className: "article-art-pine",
                },
              ].map(({ title, category, icon: Icon, className }) => (
                <button
                  type="button"
                  className="marketing-article-card"
                  key={title}
                  onClick={() => setArticle(title)}
                >
                  <span className={`article-art ${className}`}>
                    <Icon size={60} strokeWidth={0.8} />
                    <span>LEYER / JOURNAL</span>
                  </span>
                  <span className="article-card-copy">
                    <small>
                      {category} <span>4 min de lectura</span>
                    </small>
                    <strong>{title}</strong>
                    <span>
                      Leer artículo <ArrowUpRight size={13} />
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      <div className="marketing-cta">
        <div>
          <p>EL PRIMER PASO ES CONVERSAR</p>
          <h4>Empecemos por tu historia.</h4>
        </div>
        <Button variant="secondary" onClick={() => setConsultation(true)}>
          Agenda una conversación <ArrowUpRight />
        </Button>
      </div>
      <div className="marketing-footer">
        <Brand />
        <span>Estudio de ejemplo · Diseñado con Leyer</span>
      </div>
      <Dialog
        open={consultation}
        onOpenChange={setConsultation}
        title="Conversemos sobre tu caso"
        description="Este formulario permite revisar el diseño. No envía información ni coordina reuniones reales."
      >
        <form className="space-y-4" onSubmit={consultationSubmit}>
          <div className="space-y-2">
            <Label htmlFor="consultation-name">Tu nombre</Label>
            <Input
              id="consultation-name"
              name="name"
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="consultation-email">Correo electrónico</Label>
            <Input
              id="consultation-email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Probar formulario <ArrowRight />
          </Button>
        </form>
      </Dialog>
    </div>
  );
}

function AdministrationPreview({
  notify,
}: {
  notify: (message: string) => void;
}) {
  const [section, setSection] = useState("content");
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewRow, setViewRow] = useState<ContentRow | null>(null);
  const [deleteRow, setDeleteRow] = useState<ContentRow | null>(null);
  const visibleRows = rows.filter(
    (row) =>
      row.title
        .toLocaleLowerCase("es")
        .includes(search.toLocaleLowerCase("es")) &&
      (filter === "all" || row.status === filter),
  );
  const allSelected =
    visibleRows.length > 0 &&
    visibleRows.every((row) => selected.includes(row.id));
  const columns: TableColumn<ContentRow>[] = [
    {
      key: "select",
      header: (
        <Checkbox
          aria-label="Seleccionar todos los contenidos visibles"
          checked={allSelected}
          onCheckedChange={(checked) =>
            setSelected(
              checked
                ? Array.from(
                    new Set([...selected, ...visibleRows.map((row) => row.id)]),
                  )
                : selected.filter(
                    (id) => !visibleRows.some((row) => row.id === id),
                  ),
            )
          }
        />
      ),
      cell: (row) => (
        <Checkbox
          aria-label={`Seleccionar ${row.title}`}
          checked={selected.includes(row.id)}
          onCheckedChange={(checked) =>
            setSelected(
              checked
                ? [...selected, row.id]
                : selected.filter((id) => id !== row.id),
            )
          }
        />
      ),
      className: "table-checkbox",
    },
    {
      key: "title",
      header: "Contenido",
      cell: (row) => (
        <button
          type="button"
          className="admin-content-title"
          onClick={() => setViewRow(row)}
        >
          <span>
            <FileText size={15} strokeWidth={1.5} />
          </span>
          <span>
            <strong>{row.title}</strong>
            <small>{row.type}</small>
          </span>
        </button>
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (row) => (
        <Badge variant={statusVariants[row.status]}>
          <span className="ds-status-dot" />
          {row.status}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Última edición",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{row.date}</span>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Acciones</span>,
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Acciones de ${row.title}`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setViewRow(row)}>
              <Eye />
              Ver detalle
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                setRows(
                  rows.map((item) =>
                    item.id === row.id
                      ? {
                          ...item,
                          status:
                            item.status === "Publicado"
                              ? "Borrador"
                              : "Publicado",
                          date: "Ahora",
                        }
                      : item,
                  ),
                );
                notify("Estado actualizado en la demostración.");
              }}
            >
              <Check />
              {row.status === "Publicado"
                ? "Volver a borrador"
                : "Publicar ejemplo"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onSelect={() => setDeleteRow(row)}
            >
              <Trash2 />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  function createContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setRows([
      {
        id: crypto.randomUUID(),
        title: String(data.get("title")).trim(),
        type: String(data.get("type")),
        status: "Borrador",
        date: "Ahora",
      },
      ...rows,
    ]);
    setSearch("");
    setFilter("all");
    setCreateOpen(false);
    notify("Borrador agregado a la vista de ejemplo.");
  }
  return (
    <>
      <AdminShell
        siteName="Estudio de ejemplo"
        user="Claudia A."
        activeSection={section}
        onNavigate={setSection}
        onNotifications={() =>
          notify("No hay notificaciones nuevas en esta demostración.")
        }
        navigation={[
          { id: "overview", label: "Vista general", icon: LayoutDashboard },
          { id: "content", label: "Contenidos", icon: FileText },
          { id: "library", label: "Biblioteca", icon: FolderOpen },
          { id: "team", label: "Equipo y roles", icon: UsersRound },
        ]}
      >
        {section === "overview" && (
          <>
            <div className="admin-heading">
              <div>
                <p>TU ESPACIO DE TRABAJO</p>
                <h3>Buen día, Claudia.</h3>
                <span>Una mirada a lo que está pasando en tu estudio.</span>
              </div>
            </div>
            <div className="admin-stat-grid">
              {[
                { label: "Contenidos", value: rows.length, icon: FileText },
                {
                  label: "Publicados",
                  value: rows.filter((row) => row.status === "Publicado")
                    .length,
                  icon: Eye,
                },
                {
                  label: "Por revisar",
                  value: rows.filter((row) => row.status === "En revisión")
                    .length,
                  icon: Clock3,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label}>
                  <Icon size={17} strokeWidth={1.5} />
                  <span>{label}</span>
                  <strong>{value.toString().padStart(2, "0")}</strong>
                  <small>Datos de ejemplo</small>
                </div>
              ))}
            </div>
            <div className="admin-next-step">
              <CalendarDays size={25} strokeWidth={1.3} />
              <div>
                <h4>Tu próxima buena historia empieza aquí.</h4>
                <p>Prepara una nueva página para conectar con tus clientes.</p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setSection("content");
                  setCreateOpen(true);
                }}
              >
                Crear contenido <Plus />
              </Button>
            </div>
          </>
        )}
        {section === "content" && (
          <>
            <div className="admin-heading">
              <div>
                <p>TU SITIO, SIEMPRE AL DÍA</p>
                <h3>Contenidos</h3>
                <span>Crea, organiza y da vida a las ideas de tu estudio.</span>
              </div>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus />
                Nuevo contenido
              </Button>
            </div>
            <div className="admin-content-card">
              <div className="admin-content-filters">
                <div className="admin-search">
                  <Search size={14} />
                  <Input
                    aria-label="Buscar contenidos de ejemplo"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar contenido…"
                  />
                </div>
                <Select
                  aria-label="Filtrar por estado"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  {Object.keys(statusVariants).map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </Select>
              </div>
              {selected.length > 0 && (
                <div className="admin-selection">
                  <span>{selected.length} seleccionados</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setRows(
                        rows.map((row) =>
                          selected.includes(row.id)
                            ? { ...row, status: "Borrador", date: "Ahora" }
                            : row,
                        ),
                      );
                      setSelected([]);
                      notify("La selección volvió a borrador en el ejemplo.");
                    }}
                  >
                    Volver a borrador
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelected([])}
                  >
                    Limpiar
                  </Button>
                </div>
              )}
              {visibleRows.length ? (
                <DataTable
                  caption="Contenidos de demostración del estudio"
                  columns={columns}
                  rows={visibleRows}
                  rowKey={(row) => row.id}
                />
              ) : (
                <div className="p-5">
                  <EmptyState
                    icon={Search}
                    title="No encontramos coincidencias"
                    description="Prueba con otro título o cambia el filtro de estado."
                    action={
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSearch("");
                          setFilter("all");
                        }}
                      >
                        Limpiar búsqueda
                      </Button>
                    }
                  />
                </div>
              )}
              <div className="admin-table-footer">
                <span>
                  {visibleRows.length} de {rows.length} contenidos
                </span>
                <span>Vista de demostración</span>
              </div>
            </div>
            <p className="admin-help-note">
              <ShieldCheck size={13} />
              El equipo trabaja en borradores. Tú decides cuándo se publican.
            </p>
          </>
        )}
        {section === "library" && (
          <>
            <div className="admin-heading">
              <div>
                <p>TODO TIENE SU LUGAR</p>
                <h3>Biblioteca</h3>
                <span>Imágenes y archivos para contar tu historia.</span>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <ImageUploader label="Agregar una imagen a la biblioteca" />
            </div>
          </>
        )}
        {section === "team" && (
          <>
            <div className="admin-heading">
              <div>
                <p>MEJOR, EN EQUIPO</p>
                <h3>Equipo y roles</h3>
                <span>
                  Las personas correctas, con el acceso que necesitan.
                </span>
              </div>
            </div>
            <div className="admin-team-list">
              {[
                {
                  name: "Claudia A.",
                  initials: "CA",
                  role: "Administrador",
                  description: "Contenido y configuración",
                  variant: "success" as const,
                },
                {
                  name: "Nicolás R.",
                  initials: "NR",
                  role: "Abogado",
                  description: "Trabajo jurídico",
                  variant: "info" as const,
                },
                {
                  name: "Nueva integrante",
                  initials: "NI",
                  role: "Sin acceso",
                  description: "Pendiente de habilitación",
                  variant: "neutral" as const,
                },
              ].map((member) => (
                <div key={member.name}>
                  <span className="admin-avatar">{member.initials}</span>
                  <div>
                    <strong>{member.name}</strong>
                    <p>{member.description}</p>
                  </div>
                  <Badge variant={member.variant}>{member.role}</Badge>
                </div>
              ))}
            </div>
            <p className="admin-help-note">
              <ShieldCheck size={13} />
              El acceso administrativo lo habilita la persona responsable del sitio.
            </p>
          </>
        )}
      </AdminShell>
      <Dialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Dale vida a una nueva idea"
        description="Crea un borrador de ejemplo. Solo existirá mientras revisas esta página."
      >
        <form onSubmit={createContent} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="new-content-title">Título del contenido</Label>
            <Input
              id="new-content-title"
              name="title"
              placeholder="¿Qué historia quieres contar?"
              required
              minLength={2}
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-content-type">Tipo de contenido</Label>
            <Select id="new-content-type" name="type">
              <option>Landing</option>
              <option>Artículo</option>
              <option>Página</option>
            </Select>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Crear borrador <Plus />
            </Button>
          </div>
        </form>
      </Dialog>
      <Dialog
        open={!!viewRow}
        onOpenChange={(open) => {
          if (!open) setViewRow(null);
        }}
        title={viewRow?.title || "Contenido"}
        description="Detalle del contenido de demostración."
      >
        {viewRow && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Badge variant={statusVariants[viewRow.status]}>
                {viewRow.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {viewRow.type}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Aquí se compondrá el contenido con portadas, textos, tarjetas y
              preguntas frecuentes del sistema de diseño.
            </p>
            <Button variant="outline" onClick={() => setViewRow(null)}>
              Volver a contenidos
            </Button>
          </div>
        )}
      </Dialog>
      <Dialog
        open={!!deleteRow}
        onOpenChange={(open) => {
          if (!open) setDeleteRow(null);
        }}
        title="¿Eliminar este ejemplo?"
        description={`Se quitará “${deleteRow?.title || ""}” de la tabla de demostración. No afecta contenido real.`}
      >
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteRow(null)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setRows(rows.filter((row) => row.id !== deleteRow?.id));
              setSelected(selected.filter((id) => id !== deleteRow?.id));
              setDeleteRow(null);
              notify("Contenido retirado de la demostración.");
            }}
          >
            Eliminar contenido
          </Button>
        </div>
      </Dialog>
    </>
  );
}
