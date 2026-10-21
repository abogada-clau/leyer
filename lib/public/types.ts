import type { Json, Snapshot, Block } from "@/lib/admin/types";
export type PublicSite = {
  id: string;
  organization_id: string;
  organization_slug: string;
  slug: string;
  name: string;
  domain: string | null;
  default_locale: string;
  settings: Record<string, Json>;
};
export type PublicContext = {
  site: PublicSite;
  basePath: string;
  origin: string;
  locale: string;
  path: string;
  requestPath: string;
  local: boolean;
};
export type PublicEntry = {
  id: string;
  organization_id: string;
  site_id: string;
  kind: string;
  locale: string;
  parent_id: string | null;
  first_published_at: string | null;
  revision_id: string;
  title: string;
  excerpt: string;
  path: string;
  cover_asset_id: string | null;
  template_key: string;
  template_version: number;
  seo: Record<string, Json>;
};
export type PublicDocument = PublicEntry & Omit<Snapshot, "id">;
export type PublicAsset = {
  id: string;
  site_id: string;
  bucket_id: "cms-public";
  storage_path: string;
  mime_type: string;
  byte_size: number;
  width: number | null;
  height: number | null;
  alt_text: string;
  credits: string | null;
  src: string;
};
export type PublicAuthor = {
  id: string;
  site_id: string;
  display_name: string;
  slug: string;
  biography: string;
  professional_title: string;
  avatar_asset_id: string | null;
  is_public: boolean;
};
export type PublicTerm = {
  id: string;
  taxonomy_id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};
export type PublicTaxonomy = { id: string; code: string; name: string };
export type Menu = { id: string; code: string; name: string; locale: string };
export type MenuItem = {
  id: string;
  menu_id: string;
  parent_id: string | null;
  label: string;
  position: number;
  entry_id: string | null;
  external_url: string | null;
};
export type RenderData = {
  document: PublicDocument;
  assets: PublicAsset[];
  authors: PublicAuthor[];
  terms: PublicTerm[];
  taxonomies: PublicTaxonomy[];
  related: PublicEntry[];
};
export type SharedRenderDocument = {
  title: string;
  excerpt: string;
  cover_asset_id: string | null;
  template_key: string;
  template_version: number;
  blocks: Block[];
};
