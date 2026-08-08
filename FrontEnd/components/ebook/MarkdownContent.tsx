"use client";

import { isValidElement, Children, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";

interface MarkdownContentProps {
  markdown: string;
}


function CodeBlock({
  language,
  children,
}: {
  language?: string;
  children: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="markdown-code-block">
      <div className="markdown-code-toolbar">
        <span>{language || "code"}</span>
        <button type="button" onClick={copyCode} aria-label="Copy code">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code className={language ? `language-${language}` : undefined}>
          {code}
        </code>
      </pre>
    </div>
  );
}

function MarkdownPre({ children }: { children?: ReactNode }) {
  const child = Children.toArray(children)[0];
  if (isValidElement<{ className?: string; children?: ReactNode }>(child)) {
    const className = child.props.className ?? "";
    const language = className.match(/language-(\w+)/)?.[1];
    return <CodeBlock language={language}>{child.props.children}</CodeBlock>;
  }
  return <pre>{children}</pre>;
}

export default function MarkdownContent({ markdown }: MarkdownContentProps) {
  return (
    <div className="markdown-lesson-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
        components={{
          pre: MarkdownPre,
          code({ className, children, ...props }) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="markdown-callout">{children}</blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="markdown-table-scroll adaptiv-scroll">
                <table>{children}</table>
              </div>
            );
          },
          a({ children, href, ...props }) {
            const external = href?.startsWith("http");
            return (
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
