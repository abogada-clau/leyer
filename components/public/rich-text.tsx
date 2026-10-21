import { Fragment, type ReactNode } from "react";
import type { Json } from "@/lib/admin/types";
export function RichText({
  document,
  link,
}: {
  document: Json;
  link: (href: unknown) => string | null;
}) {
  let count = 0;
  function node(value: Json, depth = 0): ReactNode {
    if (
      ++count > 10000 ||
      depth > 25 ||
      !value ||
      typeof value !== "object" ||
      Array.isArray(value)
    )
      return null;
    const children = Array.isArray(value.content)
      ? value.content
          .slice(0, 1000)
          .map((v, i) => <Fragment key={i}>{node(v, depth + 1)}</Fragment>)
      : null;
    if (value.type === "text") {
      let text: ReactNode = typeof value.text === "string" ? value.text : "";
      if (Array.isArray(value.marks))
        for (const m of value.marks) {
          if (!m || typeof m !== "object" || Array.isArray(m)) continue;
          if (m.type === "bold") text = <strong>{text}</strong>;
          if (m.type === "italic") text = <em>{text}</em>;
          if (m.type === "underline") text = <u>{text}</u>;
          if (m.type === "strike") text = <del>{text}</del>;
          if (m.type === "code") text = <code>{text}</code>;
          if (m.type === "link") {
            const attrs = m.attrs;
            const href =
              attrs && typeof attrs === "object" && !Array.isArray(attrs)
                ? link(attrs.href)
                : null;
            if (href) text = <a href={href}>{text}</a>;
          }
        }
      return text;
    }
    if (value.type === "paragraph") return <p>{children}</p>;
    if (value.type === "heading") {
      const attrs = value.attrs;
      const level =
        attrs && typeof attrs === "object" && !Array.isArray(attrs)
          ? Number(attrs.level)
          : 2;
      return level === 4 ? (
        <h4>{children}</h4>
      ) : level === 3 ? (
        <h3>{children}</h3>
      ) : (
        <h2>{children}</h2>
      );
    }
    if (value.type === "bulletList") return <ul>{children}</ul>;
    if (value.type === "orderedList") return <ol>{children}</ol>;
    if (value.type === "listItem") return <li>{children}</li>;
    if (value.type === "blockquote") return <blockquote>{children}</blockquote>;
    if (value.type === "hardBreak") return <br />;
    if (value.type === "horizontalRule") return <hr />;
    if (value.type === "codeBlock")
      return (
        <pre>
          <code>{children}</code>
        </pre>
      );
    if (value.type === "doc") return <>{children}</>;
    return null;
  }
  return <div className="public-prose">{node(document)}</div>;
}
