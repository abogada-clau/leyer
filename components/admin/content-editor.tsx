"use client";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Eye, Download, History } from "lucide-react";
import { Heading, StateBadge } from "./common";
import { BlockEditor, blockLabels, makeBlock } from "./block-editor";
import { AssetPicker } from "./asset-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import {
  saveContent,
  contentOperation,
  loadSnapshot,
  latestSnapshot,
  revisionHistory,
} from "@/app/admin/actions";
import { materializeServiceContent, serviceStarterBlocks } from "@/lib/content/service-template";
import { validateSnapshot } from "@/lib/admin/validation";
import {
  entryState,
  dateTime,
  kindLabels,
  type Snapshot,
  type Entry,
  type Row,
  type ActionResult,
} from "@/lib/admin/types";

export function ContentEditor({
  entry,
  initial,

  userId,
  permissions,
  entries,
  authors,
  terms,
  taxonomies,
  revisions,
  schedules,
  serviceDefaults = {},
}: {
  entry: Entry;
  initial: Snapshot;

  userId: string;
  permissions: string[];
  entries: Entry[];
  authors: Row[];
  terms: Row[];
  taxonomies: Row[];
  revisions: Row[];
  schedules: Row[];
  serviceDefaults?: { contactPath?: string; whatsappHref?: string };
}) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const [content, setContent] = useState(initial);
  const [name, setName] = useState(entry.internal_name);
  const [parent, setParent] = useState(entry.parent_id || "");
  const [expected, setExpected] = useState<string | null>(initial.id || null);
  const serialized = JSON.stringify({ content, name, parent });
  const [baseline, setBaseline] = useState(serialized);
  const dirty = serialized !== baseline;
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult>({});
  const [blockType, setBlockType] = useState("hero");
  const [timezone, setTimezone] = useState("hora del dispositivo");
  useEffect(
    () => setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone),
    [],
  );
  const [runAt, setRunAt] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<{
    content: Snapshot;
    name: string;
    parent: string;
    expected: string | null;
  } | null>(null);
  const [remote, setRemote] = useState<Snapshot | null>(null);
  const router = useRouter();
  const canEdit = permissions.includes("content.edit");
  const canPublish = permissions.includes("content.publish");
  const canUpload = permissions.includes("media.manage");
  const storageKey = `leyer-editor:${userId}:${entry.id}`;
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const draft = JSON.parse(saved);
        if (
          draft.content &&
          JSON.stringify({
            content: draft.content,
            name: draft.name,
            parent: draft.parent,
          }) !== baseline
        )
          setRecovery(draft);
      }
    } catch {
      /* Storage is optional. */
    }
  }, [storageKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ content, name, parent, expected }),
        );
      } catch {
        /* In-memory editing still works. */
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [dirty, content, name, parent, expected, storageKey]);
  useEffect(() => {
    if (!dirty) return;
    const flush = () => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ content, name, parent, expected }),
        );
      } catch {}
    };
    const before = (e: BeforeUnloadEvent) => {
      flush();
      e.preventDefault();
    };
    const beforeNavigate = (e: Event) => {
      flush();
      if (
        !window.confirm(
          "Tienes cambios sin guardar. ¿Quieres salir? Tu copia local se conserva en este navegador.",
        )
      )
        e.preventDefault();
    };
    const click = (e: MouseEvent) => {
      flush();
      const a = (e.target as HTMLElement).closest("a");
      if (
        a &&
        a.target !== "_blank" &&
        !a.hasAttribute("download") &&
        new URL(a.href, location.href).href !== location.href &&
        !window.confirm(
          "Tienes cambios sin guardar. ¿Quieres salir? Tu copia local se conserva en este navegador.",
        )
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", before);
    window.addEventListener("leyer:before-navigate", beforeNavigate);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", before);
      window.removeEventListener("leyer:before-navigate", beforeNavigate);
      document.removeEventListener("click", click, true);
    };
  }, [dirty, content, name, parent, expected, storageKey]);
  const change = (v: Partial<Snapshot>) => setContent({ ...content, ...v });
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ content, name, parent, expected }, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `leyer-${entry.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function save() {
    start(async () => {
      try {
        validateSnapshot(content);
        const r = await saveContent({

          entryId: entry.id,
          expectedRevisionId: expected,
          internalName: name,
          parentId: parent || null,
          content,
        });
        setResult(r);
        if (r.id) {
          setOlder([]);
          setMoreHistory(true);
          setExpected(r.id);
          setContent({
            ...content,
            id: r.id,
            editorial_state: "draft",
            locked_at: null,
          });
          setBaseline(
            JSON.stringify({
              content: {
                ...content,
                id: r.id,
                editorial_state: "draft",
                locked_at: null,
              },
              name,
              parent,
            }),
          );
          try {
            localStorage.removeItem(storageKey);
          } catch {}
          setRecovery(null);
          router.refresh();
        }
      } catch (e) {
        setResult({
          error:
            e instanceof Error
              ? e.message
              : "No se pudo guardar. Tu trabajo se conserva; reintenta.",
        });
      }
    });
  }
  function operate(operation: string) {
    start(async () => {
      try {
        const r = await contentOperation({

          entryId: entry.id,
          revisionId: expected || undefined,
          operation,
          runAt: runAt ? new Date(runAt).toISOString() : undefined,
        });
        setResult(r);
        if (!r.error) {
          setConfirm(null);
          if (["draft", "in_review", "approved"].includes(operation)) {
            const next = { ...content, editorial_state: operation };
            setContent(next);
            setBaseline(JSON.stringify({ content: next, name, parent }));
          }
          router.refresh();
        }
      } catch {
        setResult({ error: "No se pudo completar la operación. Reintenta." });
      }
    });
  }
  async function restore(id: string) {
    start(async () => {
      try {
        const snapshot = await loadSnapshot(entry.id, id);
        setContent({
          ...snapshot,
          id: expected || undefined,
          editorial_state: "draft",
          locked_at: null,
        });
        setResult({
          message:
            "Revisión recuperada en el editor. Guarda para crear una nueva revisión; el historial y la versión publicada se conservan.",
        });
      } catch {
        setResult({ error: "No se pudo recuperar la revisión." });
      }
    });
  }
  const [older, setOlder] = useState<Row[]>([]);
  const [moreHistory, setMoreHistory] = useState(true);
  const history = [
    ...revisions,
    ...older.filter((r) => !revisions.some((current) => current.id === r.id)),
  ];
  const currentRevision = revisions.find((r) => r.id === expected);
  const locked = Boolean(currentRevision?.locked_at || content.locked_at);
  const editorialState = String(
    currentRevision?.editorial_state || content.editorial_state || "draft",
  );
  return (
    <>
      <Heading
        title={name || "Editar contenido"}
        description={`${kindLabels[entry.kind]} · ${entry.locale} · ${entryState(entry)}`}
      >
        <Button asChild variant="outline">
          <Link href="/admin/content">Volver a contenidos</Link>
        </Button>
      </Heading>
      {recovery && canEdit && (
        <Alert
          className="mb-5"
          variant="warning"
          title="Hay una copia local sin guardar"
        >
          <p>
            Recupera tu trabajo o descártalo. Se comprobará la revisión esperada
            al guardar.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => {
                setContent(recovery.content);
                setName(recovery.name);
                setParent(recovery.parent);
                setExpected(recovery.expected);
                setRecovery(null);
              }}
            >
              Recuperar mi trabajo
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                localStorage.removeItem(storageKey);
                setRecovery(null);
              }}
            >
              Descartar copia
            </Button>
          </div>
        </Alert>
      )}
      <div className="editor-sticky flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted-foreground">
          {pending
            ? "Procesando…"
            : dirty
              ? "Cambios sin guardar · copia local automática"
              : "Todos los cambios están guardados"}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={download}>
            <Download />
            Descargar copia
          </Button>
          {expected && (
            <Button asChild variant="outline" size="sm">
              <Link
                target="_blank"
                href={`/admin/content/${entry.id}/preview?revision=${expected}`}
              >
                <Eye />
                Previsualizar guardado
              </Link>
            </Button>
          )}
          {canEdit && (
            <Button
              type="submit"
              form="content-editor"
              disabled={!hydrated || pending || !dirty}
            >
              <Save />
              Guardar revisión
            </Button>
          )}
        </div>
      </div>
      {result.error && (
        <Alert
          className="mb-5"
          variant="error"
          title={
            result.conflict
              ? "Conflicto de edición"
              : "No se completó la operación"
          }
        >
          <p>{result.error}</p>
          {result.conflict && (
            <Button
              className="mt-3"
              size="sm"
              variant="outline"
              onClick={() =>
                start(async () => {
                  try {
                    setRemote(await latestSnapshot(entry.id));
                  } catch {
                    setResult({
                      error: "No se pudo consultar la versión actual.",
                    });
                  }
                })
              }
            >
              Comparar con la revisión actual
            </Button>
          )}
        </Alert>
      )}
      {result.message && (
        <Alert className="mb-5" variant="success" title={result.message} />
      )}
      <div className="editor-columns">
        <form
          id="content-editor"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <fieldset
            disabled={!hydrated || !canEdit || pending}
            className="min-w-0 space-y-6"
          >
            <section className="panel-card">
              <h2>Información del contenido</h2>
              <div className="panel-fields">
                <div className="panel-field wide">
                  <Label htmlFor="internal-name">Nombre interno</Label>
                  <Input
                    id="internal-name"
                    maxLength={250}
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="panel-field wide">
                  <Label htmlFor="content-title">Título</Label>
                  <Input
                    id="content-title"
                    maxLength={300}
                    required
                    value={content.title}
                    onChange={(e) => change({ title: e.target.value })}
                  />
                </div>
                <div className="panel-field wide">
                  <Label htmlFor="excerpt">Extracto</Label>
                  <Textarea
                    id="excerpt"
                    rows={3}
                    value={content.excerpt}
                    onChange={(e) => change({ excerpt: e.target.value })}
                  />
                </div>
                <div className="panel-field">
                  <Label htmlFor="path">Ruta</Label>
                  <Input
                    id="path"
                    required
                    value={content.path}
                    onChange={(e) => change({ path: e.target.value })}
                  />
                  <small>Ejemplo: /servicios/familia</small>
                </div>
                <div className="panel-field">
                  <Label htmlFor="parent">Contenido superior</Label>
                  <Select
                    id="parent"
                    value={parent}
                    onChange={(e) => setParent(e.target.value)}
                  >
                    <option value="">Sin jerarquía</option>
                    {entries
                      .filter((e) => e.id !== entry.id)
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.internal_name}
                        </option>
                      ))}
                  </Select>
                </div>
                <div className="panel-field">
                  <Label htmlFor="template">Plantilla</Label>
                  <Input
                    list="templates"
                    id="template"
                    required
                    value={content.template_key}
                    onChange={(e) => change({ template_key: e.target.value, template_version: e.target.value === "service-landing" ? 2 : 1 })}
                  />
                  <datalist id="templates">
                    <option value="default" />
                    <option value="service-landing" />
                    <option value="article" />
                  </datalist>
                </div>
                <div className="panel-field">
                  <Label htmlFor="template-version">Versión de plantilla</Label>
                  <Input
                    id="template-version"
                    type="number"
                    min={1}
                    required
                    value={content.template_version}
                    onChange={(e) =>
                      change({ template_version: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="panel-field wide">
                  <Label>Imagen de portada</Label>
                  <AssetPicker
                    canUpload={canUpload}
                    value={content.cover_asset_id}
                    onChange={(id) => change({ cover_asset_id: id })}
                  />
                </div>
              </div>
            </section>
            <section className="panel-card">
              <h2>Composición por bloques</h2>
              <p className="text-sm text-muted-foreground">
                Agrega, edita y ordena secciones. La biblioteca conserva las
                referencias a cada recurso.
              </p>
              {content.template_key === "service-landing" && content.template_version < 2 && <Alert title="Composición anterior"><p>Convierte los elementos de la plantilla en contenido editable. Se creará una nueva revisión al guardar.</p><Button type="button" variant="outline" onClick={() => {
                const author = authors.find(author => content.authors.includes(author.id) && author.avatar_asset_id);
                const assetId = content.cover_asset_id || author?.avatar_asset_id;
                change(materializeServiceContent(content, { ...serviceDefaults, heroAsset: typeof assetId === "string" ? { asset_id: assetId, slot: "image", alt_text: String(author?.display_name || ""), focal_point: { x: .5, y: .5 } } : undefined }));
              }}>Convertir a contenido editable</Button></Alert>}
              {content.template_key === "service-landing" && content.blocks.length === 0 && <Button type="button" variant="outline" onClick={() => {
                const hero = makeBlock("hero"); hero.data.heading = content.title;
                const cta = makeBlock("cta");
                if (serviceDefaults.contactPath && Array.isArray(cta.data.actions)) cta.data.actions = [{ label: "", href: serviceDefaults.contactPath, icon: "none", style: "primary" }];
                change({ template_version: 2, blocks: [hero, makeBlock("split_content"), ...serviceStarterBlocks(), makeBlock("checklist"), makeBlock("card_grid"), makeBlock("steps"), makeBlock("faq"), cta] });
              }}>Agregar estructura de servicio</Button>}
              {content.blocks.map((b, index) => (
                <BlockEditor
                  key={b.key}
                  block={b}
                  index={index}
                  total={content.blocks.length}
                  canUpload={canUpload}
                  disabled={!hydrated || !canEdit || pending}
                  onChange={(block) =>
                    change({
                      blocks: content.blocks.map((v, i) =>
                        i === index ? block : v,
                      ),
                    })
                  }
                  onMove={(direction) => {
                    const blocks = [...content.blocks];
                    [blocks[index], blocks[index + direction]] = [
                      blocks[index + direction],
                      blocks[index],
                    ];
                    change({ blocks });
                  }}
                  onDuplicate={() => {
                    const blocks = [...content.blocks];
                    blocks.splice(index + 1, 0, {
                      ...structuredClone(b),
                      key: crypto.randomUUID(),
                    });
                    change({ blocks });
                  }}
                  onRemove={() => {
                    setConfirm(`block:${b.key}`);
                  }}
                />
              ))}
              <div className="mt-6 flex flex-wrap gap-2">
                <Select
                  aria-label="Tipo de bloque a agregar"
                  value={blockType}
                  onChange={(e) => setBlockType(e.target.value)}
                >
                  {Object.entries(blockLabels).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    change({
                      blocks: [...content.blocks, makeBlock(blockType)],
                    })
                  }
                >
                  <Plus />
                  Agregar bloque
                </Button>
              </div>
            </section>
            <section className="panel-card">
              <h2>SEO</h2>
              <div className="space-y-4">
                {[
                  ["title", "Título para buscadores"],
                  ["description", "Descripción para buscadores"],
                  ["canonical_url", "URL canónica"],
                  ["og_title", "Título al compartir"],
                  ["og_description", "Descripción al compartir"],
                ].map(([k, label]) => (
                  <div className="panel-field" key={k}>
                    <Label htmlFor={`seo-${k}`}>{label}</Label>
                    <Input
                      id={`seo-${k}`}
                      value={String(content.seo[k] || "")}
                      onChange={(e) =>
                        change({ seo: { ...content.seo, [k]: e.target.value } })
                      }
                    />
                  </div>
                ))}
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={content.seo.noindex === true}
                    onCheckedChange={(v) =>
                      change({ seo: { ...content.seo, noindex: v === true } })
                    }
                  />
                  Solicitar que los buscadores no indexen esta página
                </label>
              </div>
            </section>
            <section className="panel-card">
              <h2>Autores, categorías y etiquetas</h2>
              <div className="space-y-5">
                <fieldset>
                  <legend className="mb-3 font-medium">Autores</legend>
                  {authors.length ? (
                    authors.map((a) => (
                      <label
                        key={a.id}
                        className="mb-3 flex items-center gap-2"
                      >
                        <Checkbox
                          checked={content.authors.includes(a.id)}
                          onCheckedChange={(v) =>
                            change({
                              authors: v
                                ? [...content.authors, a.id]
                                : content.authors.filter((id) => id !== a.id),
                            })
                          }
                        />
                        {String(a.display_name)}
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Crea autores en Autores y taxonomías.
                    </p>
                  )}
                </fieldset>
                {taxonomies.map((t) => (
                  <fieldset key={t.id}>
                    <legend className="mb-3 font-medium">
                      {String(t.name)}
                    </legend>
                    {terms
                      .filter((term) => term.taxonomy_id === t.id)
                      .map((term) => (
                        <label
                          className="mb-3 flex items-center gap-2"
                          key={term.id}
                        >
                          <Checkbox
                            checked={content.terms.includes(term.id)}
                            onCheckedChange={(v) =>
                              change({
                                terms: v
                                  ? [...content.terms, term.id]
                                  : content.terms.filter(
                                      (id) => id !== term.id,
                                    ),
                              })
                            }
                          />
                          {String(term.name)}
                        </label>
                      ))}
                  </fieldset>
                ))}
                <fieldset>
                  <legend className="mb-3 font-medium">
                    Contenidos relacionados
                  </legend>
                  {entries
                    .filter((e) => e.id !== entry.id)
                    .map((e) => (
                      <label
                        className="mb-3 flex items-center gap-2"
                        key={e.id}
                      >
                        <Checkbox
                          checked={content.relations.some(
                            (r) => r.entry_id === e.id,
                          )}
                          onCheckedChange={(v) =>
                            change({
                              relations: v
                                ? [
                                    ...content.relations,
                                    { entry_id: e.id, type: "related" },
                                  ]
                                : content.relations.filter(
                                    (r) => r.entry_id !== e.id,
                                  ),
                            })
                          }
                        />
                        {e.internal_name}
                      </label>
                    ))}
                </fieldset>
              </div>
            </section>
          </fieldset>
        </form>
        <aside className="space-y-6">
          <section className="panel-card">
            <h2>Flujo editorial</h2>
            <div className="space-y-3">
              <StateBadge
                state={
                  locked
                    ? "Publicado"
                    : (
                        {
                          draft: "Borrador",
                          in_review: "En revisión",
                          approved: "Aprobado",
                        } as Record<string, string>
                      )[editorialState]
                }
              />
              <p className="text-xs text-muted-foreground">
                Las acciones afectan a la revisión guardada. Guarda tus cambios
                antes de continuar.
              </p>
              {entry.archived_at && (
                <Alert variant="warning" title="Contenido archivado">
                  Su historial permanece disponible. No se puede publicar
                  mientras esté archivado.
                </Alert>
              )}
              {!locked && canEdit && (
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={
                    pending ||
                    dirty ||
                    !expected ||
                    editorialState === "in_review"
                  }
                  onClick={() => operate("in_review")}
                >
                  Enviar a revisión
                </Button>
              )}
              {!locked && canPublish && (
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={
                    pending ||
                    dirty ||
                    !expected ||
                    editorialState === "approved"
                  }
                  onClick={() => operate("approved")}
                >
                  Aprobar revisión
                </Button>
              )}
              {!locked && canEdit && editorialState !== "draft" && (
                <Button
                  className="w-full"
                  variant="ghost"
                  disabled={pending || dirty}
                  onClick={() => operate("draft")}
                >
                  Devolver a borrador
                </Button>
              )}
              {canPublish && (
                <>
                  <Button
                    className="w-full"
                    disabled={
                      pending ||
                      dirty ||
                      !expected ||
                      editorialState !== "approved" ||
                      Boolean(entry.archived_at)
                    }
                    onClick={() => setConfirm("publish")}
                  >
                    Publicar revisión
                  </Button>
                  {entry.archived_at && (
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled={pending || dirty}
                      onClick={() => setConfirm("unpublish")}
                    >
                      Reactivar como borrador
                    </Button>
                  )}
                  {entry.published_revision_id && (
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled={pending || dirty}
                      onClick={() => setConfirm("unpublish")}
                    >
                      Despublicar
                    </Button>
                  )}
                  <Button
                    className="w-full"
                    variant="ghost"
                    disabled={pending || dirty || Boolean(entry.archived_at)}
                    onClick={() => setConfirm("archive")}
                  >
                    Archivar contenido
                  </Button>
                  <div className="panel-field border-t pt-4">
                    <Label htmlFor="run-at">Programar publicación</Label>
                    <Input
                      id="run-at"
                      type="datetime-local"
                      value={runAt}
                      onChange={(e) => setRunAt(e.target.value)}
                    />
                    <small>
                      Hora de este dispositivo: {timezone}. Se guarda como fecha
                      UTC.
                    </small>
                    <Button
                      variant="outline"
                      disabled={
                        !runAt ||
                        pending ||
                        dirty ||
                        !expected ||
                        editorialState !== "approved" ||
                        Boolean(entry.archived_at)
                      }
                      onClick={() => setConfirm("schedule")}
                    >
                      Programar
                    </Button>
                  </div>
                </>
              )}
              {schedules.map((j) => (
                <div key={j.id} className="rounded-lg border p-3 text-xs">
                  <p>{dateTime(String(j.run_at))}</p>
                  <div className="mt-2">
                    <StateBadge state={String(j.status)} />
                  </div>
                  {j.error_message && (
                    <p className="mt-2 text-destructive">
                      {String(j.error_message)}
                    </p>
                  )}
                  {j.status === "pending" && canPublish && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => operate("cancel")}
                    >
                      Cancelar programación
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>
          <section className="panel-card">
            <h2 className="flex items-center gap-2">
              <History size={18} />
              Historial de revisiones
            </h2>
            <div className="space-y-4">
              {!revisions.length && (
                <p className="text-sm text-muted-foreground">
                  El primer guardado iniciará el historial.
                </p>
              )}
              {history.map((r) => (
                <div key={r.id} className="border-b pb-4 text-sm">
                  <p className="font-medium">
                    Revisión {String(r.revision_number)}
                    {r.id === expected ? " · actual" : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dateTime(String(r.created_at))}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="ghost">
                      <Link
                        target="_blank"
                        href={`/admin/content/${entry.id}/preview?revision=${r.id}`}
                      >
                        Ver
                      </Link>
                    </Button>
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() => setConfirm(`restore:${r.id}`)}
                      >
                        Recuperar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {moreHistory && history.length >= 20 && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      try {
                        const rows = await revisionHistory(
                          entry.id,
                          history.length,
                        );
                        setOlder([...older, ...rows]);
                        setMoreHistory(rows.length === 20);
                      } catch {
                        setResult({
                          error:
                            "No se pudieron cargar las revisiones anteriores.",
                        });
                      }
                    })
                  }
                >
                  Cargar revisiones anteriores
                </Button>
              )}
            </div>
          </section>
        </aside>
      </div>
      <Dialog
        open={Boolean(confirm)}
        onOpenChange={(open) => {
          if (!open && !pending) setConfirm(null);
        }}
        title={
          confirm?.startsWith("restore:")
            ? "Recuperar revisión"
            : confirm?.startsWith("block:")
              ? "Quitar bloque"
              : "Confirmar acción editorial"
        }
        description={
          confirm === "publish"
            ? "Esta revisión quedará disponible en la proyección pública del sitio activo. Los recursos deben existir en el destino público."
            : confirm === "unpublish"
              ? "El contenido dejará de ser público. Se conservan su historial y la reserva de su ruta."
              : confirm === "archive"
                ? "Se retirará la publicación y se cancelará su programación. El contenido se conservará como archivado."
                : confirm === "schedule"
                  ? "La revisión aprobada se publicará mediante el worker, aunque cierres el navegador. Los permisos se volverán a comprobar al ejecutarla."
                  : confirm?.startsWith("restore:")
                    ? "La revisión elegida reemplazará la copia del editor. Al guardar se creará una nueva revisión. Descarga tu copia si tienes cambios que conservar."
                    : "El bloque se quitará de tu copia de trabajo. Las revisiones guardadas se conservan."
        }
      >
        {result.error && <Alert variant="error" title={result.error} />}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => setConfirm(null)}
          >
            Cancelar
          </Button>
          <Button
            disabled={pending}
            onClick={() => {
              if (confirm?.startsWith("restore:")) {
                restore(confirm.slice(8));
                setConfirm(null);
              } else if (confirm?.startsWith("block:")) {
                change({
                  blocks: content.blocks.filter(
                    (b) => b.key !== confirm.slice(6),
                  ),
                });
                setConfirm(null);
              } else if (confirm) operate(confirm);
            }}
          >
            {pending ? "Procesando…" : "Confirmar"}
          </Button>
        </div>
      </Dialog>
      <Dialog
        open={Boolean(remote)}
        onOpenChange={(open) => {
          if (!open) setRemote(null);
        }}
        title="Resolver conflicto"
        description="Compara ambas copias. La versión guardada por otra persona seguirá en el historial. Si continúas con tu copia, integra primero los cambios que quieras conservar."
      >
        {remote && (
          <div className="space-y-4">
            <h3>Revisión actual del servidor</h3>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs">
              {JSON.stringify(remote, null, 2)}
            </pre>
            <h3>Tu copia local</h3>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs">
              {JSON.stringify(content, null, 2)}
            </pre>
            <Button variant="outline" onClick={download}>
              Descargar mi copia
            </Button>
            <Button
              onClick={() => {
                setExpected(remote.id || null);
                setRemote(null);
                setResult({
                  message:
                    "La referencia se actualizó a la última revisión. Revisa tu copia y guarda para crear una revisión nueva.",
                });
              }}
            >
              Continuar editando mi copia tras comparar
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                download();
                setContent(remote);
                setExpected(remote.id || null);
                setRemote(null);
                setBaseline(JSON.stringify({ content: remote, name, parent }));
                setResult({});
              }}
            >
              Usar revisión del servidor y descargar mi copia
            </Button>
          </div>
        )}
      </Dialog>
    </>
  );
}
