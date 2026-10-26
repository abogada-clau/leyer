"""Capture public editorial HTML only; no scripts, forms, credentials or CMS API.

The checked-in snapshot makes SQL generation independent of the live website.
Run explicitly to refresh sources, then review the diff before rebuilding SQL.
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
import json
import urllib.request

PAGES = [
    ("compensacion", "/personas/derecho-de-familia/compensacion-economica", "familia", "familia"),
    ("cuidado", "/personas/derecho-de-familia/cuidado-personal", "familia", "familia"),
    ("relacion", "/personas/derecho-de-familia/relacion-directa-y-regular", "familia", "familia"),
    ("laboral_personas", "/personas/derecho-laboral", "personas", "laboral"),
    ("civil", "/personas/derecho-civil", "personas", "civil"),
    ("escrituras", "/personas/escrituras-publicas", "personas", "civil"),
    ("laboral_empresas", "/empresas/derecho-laboral", "empresas", "laboral"),
    ("corporativo", "/empresas/derecho-corporativo-y-comercial", "empresas", "corporativo"),
    ("propiedad", "/empresas/propiedad-intelectual", "empresas", "propiedad"),
    ("contratacion", "/empresas/contratacion-publica", "empresas", "contratacion"),
    ("preventiva", "/empresas/asesoria-preventiva-empresarial", "empresas", "corporativo"),
    ("despido", "/blog/post-de-prueba", "blog", "laboral"),
]
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
SKIP = {"script", "style", "svg", "noscript", "form", "nav", "footer", "header", "img", "button"}


class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = {"tag": "root", "attrs": {}, "children": []}
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = {"tag": tag, "attrs": dict(attrs), "children": []}
        self.stack[-1]["children"].append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i]["tag"] == tag:
                del self.stack[i:]
                break

    def handle_data(self, text):
        self.stack[-1]["children"].append(text)


def find(node, tag):
    if isinstance(node, str):
        return None
    if node["tag"] == tag:
        return node
    return next((found for child in node["children"] if (found := find(child, tag))), None)


def text(node):
    return node if isinstance(node, str) else "".join(text(c) for c in node["children"])


def clean(node):
    if isinstance(node, str):
        return node
    if node["tag"] in SKIP or node["attrs"].get("aria-hidden") == "true":
        return None
    attrs = {k: v for k, v in node["attrs"].items() if k in {"href", "datetime", "id"}}
    return {"tag": node["tag"], "attrs": attrs, "children": [value for c in node["children"] if (value := clean(c)) is not None]}


def editorial_container(node):
    if isinstance(node, str):
        return None
    if any(isinstance(c, dict) and c["tag"] == "section" and find(c, "h1") for c in node["children"]):
        return node
    return next((found for c in node["children"] if (found := editorial_container(c))), None)


def prose(node):
    if isinstance(node, str):
        return None
    if "prose" in node["attrs"].get("class", "").split():
        return node
    return next((found for c in node["children"] if (found := prose(c))), None)


def capture(page):
    key, path, parent, term = page
    url = "https://www.albarabogados.cl" + path
    request = urllib.request.Request(url, headers={"User-Agent": "Leyer editorial migration (authorized client content)"})
    with urllib.request.urlopen(request, timeout=30) as response:
        html = response.read()
    parser = Parser()
    parser.feed(html.decode("utf-8"))
    main = find(parser.root, "main") or find(parser.root, "article") or editorial_container(parser.root)
    if not main or not find(main, "h1"):
        raise ValueError("No se encontró contenido editorial: " + url)
    # Contact widgets and related-post listings are shared UI, not service copy.
    sections = [c for c in main["children"] if isinstance(c, dict) and c["tag"] == "section"]
    if not sections:
        sections = [find(main, "article") or main]
    if key == "despido":
        if "Jorge" not in text(main) or "8 de julio de 2026" not in text(main):
            raise ValueError("La autoría/fecha original cambió; revisa los metadatos antes de actualizar la captura")
        body = prose(main)
        if not body:
            raise ValueError("No se encontró el cuerpo del artículo")
        sections = [body]
    sections = [s for s in sections if s["attrs"].get("id") != "contacto" and not any(label in text(s) for label in ["Artículos relacionados", "Ponte en contacto", "Envíame tu caso"])]
    title = " ".join(text(find(main, "h1")).split())
    return {"key": key, "path": path, "parent": parent, "term": term, "title": title,
            **({"author": "Jorge", "published_date": "2026-07-08"} if key == "despido" else {}),
            "source_url": url, "html_sha256": sha256(html).hexdigest(),
            "sections": [clean(s) for s in sections]}


if __name__ == "__main__":
    with ThreadPoolExecutor(max_workers=4) as executor:
        pages = list(executor.map(capture, PAGES))
    target = Path(__file__).resolve().parents[1] / "supabase/seeds/albar/complement/source.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps({"captured_at": datetime.now(timezone.utc).isoformat(), "pages": pages}, ensure_ascii=False, indent=2) + "\n")
    for page in pages:
        print(page["key"], page["title"], len(page["sections"]))
