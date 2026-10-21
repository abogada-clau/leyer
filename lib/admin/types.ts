export type Json =
  null | boolean | number | string | Json[] | { [key: string]: Json };
export type Row = { id: string; [key: string]: Json | undefined };
export type Organization = {
  id: string;
  name: string;
  slug: string;
  status: string;
};
export type Site = {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  status: string;
  domain: string | null;
  default_locale: string;
  settings: Record<string, Json>;
  permissions: string[];
};
export type AdminContext = {
  profile: {
    id: string;
    display_name: string;
    status: string;
    preferences: Record<string, Json>;
  };
  super_admin: boolean;
  organizations: Organization[];
  memberships: {
    id: string;
    organization_id: string;
    status: string;
    roles: string[];
  }[];
  sites: Site[];
};
export type Entry = {
  id: string;
  internal_name: string;
  kind: string;
  locale: string;
  parent_id: string | null;
  published_revision_id: string | null;
  archived_at: string | null;
  updated_at: string;
  revision_id: string | null;
  revision_number: number | null;
  title: string | null;
  path: string | null;
  editorial_state: string | null;
};
export type Asset = {
  id: string;
  site_id: string;
  organization_id: string;
  bucket_id: "cms-public" | "cms-private";
  storage_path: string;
  filename: string;
  mime_type: string;
  byte_size: number;
  width: number | null;
  height: number | null;
  alt_text: string;
  credits: string | null;
  created_at: string;
};
export type Block = {
  key: string;
  type: string;
  schema_version: number;
  variant: string;
  data: Record<string, Json>;
  assets: {
    asset_id: string;
    slot: string;
    alt_text: string;
    focal_point?: Json;
  }[];
};
export type Snapshot = {
  id?: string;
  revision_number?: number;
  editorial_state?: string;
  locked_at?: string | null;
  title: string;
  excerpt: string;
  path: string;
  cover_asset_id: string | null;
  template_key: string;
  template_version: number;
  seo: Record<string, Json>;
  blocks: Block[];
  authors: string[];
  terms: string[];
  relations: { entry_id: string; type: string }[];
};
export type ActionResult = {
  error?: string;
  conflict?: boolean;
  id?: string;
  message?: string;
};
export const kindLabels: Record<string, string> = {
  page: "Página",
  landing: "Landing",
  post: "Artículo",
};
export function entryState(e: Entry) {
  if (e.archived_at) return "Archivado";
  if (e.revision_id && e.revision_id === e.published_revision_id)
    return "Publicado";
  return (
    {
      in_review: "En revisión",
      approved: "Aprobado",
      draft: "Borrador",
    } as Record<string, string>
  )[e.editorial_state || "draft"];
}
export function dateTime(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(new Date(value));
}
