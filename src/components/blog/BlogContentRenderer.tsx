import type { ReactNode } from "react";

function isSafeLinkHref(href: string): boolean {
  return href.startsWith("https://") || href.startsWith("http://") || href.startsWith("/");
}

/**
 * Renders limited inline markdown (`**bold**`, `*italic*`, `` `code` ``, and
 * `[label](url)` with safe protocol checks) purely as React nodes — never using
 * `dangerouslySetInnerHTML`.
 */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-${idx++}`;

    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(<strong key={key} className="font-semibold text-on-surface">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(<em key={key} className="italic">{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code key={key} className="font-mono text-[0.9em] bg-surface-container px-1.5 py-0.5 rounded text-on-surface">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("[")) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        const [, label, rawHref] = linkMatch;
        const href = rawHref!.trim();
        if (isSafeLinkHref(href)) {
          const external = href.startsWith("http://") || href.startsWith("https://");
          parts.push(
            <a
              key={key}
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="text-primary underline underline-offset-2 hover:opacity-80"
            >
              {label}
            </a>,
          );
        } else {
          parts.push(label);
        }
      } else {
        parts.push(token);
      }
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

/**
 * Renders structured blog markdown (headings `##` / `###`, bullet & numbered lists,
 * blockquotes `>`, horizontal rules `---`, and paragraphs) safely in React.
 */
export function BlogContentRenderer({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let blockKey = 0;

  while (i < lines.length) {
    const line = lines[i]!;
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      blocks.push(<hr key={`b-${blockKey++}`} className="border-surface-variant my-4" />);
      i++;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3 key={`b-${blockKey++}`} className="font-headline-sm text-headline-sm text-on-surface mt-4">
          {renderInline(trimmed.slice(4), `h3-${blockKey}`)}
        </h3>,
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
      const text = trimmed.startsWith("## ") ? trimmed.slice(3) : trimmed.slice(2);
      blocks.push(
        <h2 key={`b-${blockKey++}`} className="font-headline-md text-headline-md text-on-surface mt-6">
          {renderInline(text, `h2-${blockKey}`)}
        </h2>,
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i]!.trim().startsWith("> ")) {
        quoteLines.push(lines[i]!.trim().slice(2));
        i++;
      }
      blocks.push(
        <blockquote
          key={`b-${blockKey++}`}
          className="border-l-4 border-primary-container bg-surface-container-low px-4 py-3 rounded-r-xl font-body-md text-body-md text-on-surface italic"
        >
          {renderInline(quoteLines.join(" "), `bq-${blockKey}`)}
        </blockquote>,
      );
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i]!.trim())) {
        items.push(lines[i]!.trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={`b-${blockKey++}`} className="list-disc pl-6 flex flex-col gap-2 font-body-md text-body-md text-on-surface-variant">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `ul-${blockKey}-${idx}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i]!.trim())) {
        items.push(lines[i]!.trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={`b-${blockKey++}`} className="list-decimal pl-6 flex flex-col gap-2 font-body-md text-body-md text-on-surface-variant">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `ol-${blockKey}-${idx}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i]!.trim() !== "" &&
      !/^(#{1,3}\s|>\s|[-*]\s|\d+\.\s|---+$)/.test(lines[i]!.trim())
    ) {
      paragraphLines.push(lines[i]!.trim());
      i++;
    }
    blocks.push(
      <p key={`b-${blockKey++}`} className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
        {renderInline(paragraphLines.join(" "), `p-${blockKey}`)}
      </p>,
    );
  }

  return <div className="flex flex-col gap-4">{blocks}</div>;
}
