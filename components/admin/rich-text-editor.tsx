"use client";
import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { safeHref } from "@/lib/admin/validation";
import type { Json } from "@/lib/admin/types";
export function RichTextEditor({
  value,
  onChange,
  id,
  disabled = false,
}: {
  value: Json;
  onChange: (value: Json) => void;
  id: string;
  disabled?: boolean;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [href, setHref] = useState("");
  const [error, setError] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: false,
          isAllowedUri: (url) => safeHref(url),
        },
      }),
    ],
    content: value as Record<string, unknown>,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editable: !disabled,
    editorProps: {
      attributes: {
        id,
        role: "textbox",
        "aria-labelledby": `${id}-label`,
        "aria-multiline": "true",
        class: "rich-text-body min-h-52 p-4 outline-none",
      },
    },
    onUpdate: ({ editor: instance }) => onChange(instance.getJSON() as Json),
  });
  useEffect(() => {
    if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(value))
      editor.commands.setContent(value as Record<string, unknown>, {
        emitUpdate: false,
      });
  }, [editor, value]);
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);
  if (!editor)
    return (
      <div
        role="status"
        className="rounded-lg border p-5 text-sm text-muted-foreground"
      >
        Cargando editor de texto…
      </div>
    );
  const tools = [
    {
      label: "Negrita",
      icon: Bold,
      active: editor.isActive("bold"),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Cursiva",
      icon: Italic,
      active: editor.isActive("italic"),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Subrayado",
      icon: Underline,
      active: editor.isActive("underline"),
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      label: "Lista con viñetas",
      icon: List,
      active: editor.isActive("bulletList"),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Lista numerada",
      icon: ListOrdered,
      active: editor.isActive("orderedList"),
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Cita destacada",
      icon: Quote,
      active: editor.isActive("blockquote"),
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
  ];
  return (
    <div className="space-y-2">
      <Label id={`${id}-label`}>Texto enriquecido</Label>
      <div className="overflow-hidden rounded-lg border bg-card focus-within:ring-2 focus-within:ring-ring/20">
        <div
          role="group"
          aria-label="Formato del texto"
          className="flex flex-wrap gap-1 border-b bg-muted/30 p-2"
        >
          <Select
            aria-label="Estilo de párrafo"
            disabled={disabled}
            value={
              editor.isActive("heading", { level: 2 })
                ? "2"
                : editor.isActive("heading", { level: 3 })
                  ? "3"
                  : editor.isActive("heading", { level: 4 })
                    ? "4"
                    : "paragraph"
            }
            onChange={(e) => {
              if (e.target.value === "paragraph")
                editor.chain().focus().setParagraph().run();
              else
                editor
                  .chain()
                  .focus()
                  .toggleHeading({ level: Number(e.target.value) as 2 | 3 | 4 })
                  .run();
            }}
          >
            <option value="paragraph">Párrafo</option>
            <option value="2">Título de sección</option>
            <option value="3">Subtítulo</option>
            <option value="4">Título menor</option>
          </Select>
          {tools.map((t) => (
            <Button
              key={t.label}
              type="button"
              variant={t.active ? "secondary" : "ghost"}
              size="icon"
              aria-label={t.label}
              aria-pressed={t.active}
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={t.run}
            >
              <t.icon />
            </Button>
          ))}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Editar enlace"
            aria-pressed={editor.isActive("link")}
            disabled={disabled}
            onClick={() => {
              setHref(String(editor.getAttributes("link").href || ""));
              setError("");
              setLinkOpen(true);
            }}
          >
            <LinkIcon />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Deshacer texto"
            disabled={disabled || !editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Rehacer texto"
            disabled={disabled || !editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo />
          </Button>
        </div>
        <EditorContent editor={editor} />
      </div>
      <Dialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        title="Enlace del texto"
        description="Selecciona texto en el editor y escribe su destino. Puedes usar una ruta del sitio, HTTPS, mailto: o tel:."
      >
        <div className="space-y-4">
          <Label htmlFor={`${id}-href`}>Destino</Label>
          <Input
            id={`${id}-href`}
            value={href}
            onChange={(e) => setHref(e.target.value)}
          />
          {error && <Alert variant="error" title={error} />}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .extendMarkRange("link")
                  .unsetLink()
                  .run();
                setLinkOpen(false);
              }}
            >
              Quitar enlace
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!safeHref(href)) {
                  setError(
                    "Escribe un destino seguro: /ruta, https://, mailto: o tel:.",
                  );
                  return;
                }
                editor
                  .chain()
                  .focus()
                  .extendMarkRange("link")
                  .setLink({ href })
                  .run();
                setLinkOpen(false);
              }}
            >
              Aplicar enlace
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
