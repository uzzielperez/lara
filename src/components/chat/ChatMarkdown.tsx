"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
} from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BR_TOKEN = "\u2063BR\u2063";

function normalizeChatMarkdown(raw: string): string {
  return raw.replace(/<br\s*\/?>/gi, BR_TOKEN);
}

function withBreaks(node: ReactNode): ReactNode {
  return Children.map(node, (child, index) => {
    if (typeof child === "string") {
      const parts = child.split(BR_TOKEN);
      if (parts.length === 1) return child;
      return parts.map((part, i) => (
        <span key={`${index}-${i}`}>
          {i > 0 ? <br /> : null}
          {part}
        </span>
      ));
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children) {
      return cloneElement(child, {
        children: withBreaks(child.props.children),
      });
    }
    return child;
  });
}

const components: Components = {
  a({ href, children }) {
    const url = href ?? "";
    const external = /^https?:\/\//i.test(url);
    return (
      <a href={url} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
        {withBreaks(children)}
      </a>
    );
  },
  p({ children }) {
    return <p>{withBreaks(children)}</p>;
  },
  li({ children }) {
    return <li>{withBreaks(children)}</li>;
  },
  td({ children }) {
    return <td>{withBreaks(children)}</td>;
  },
  th({ children }) {
    return <th>{withBreaks(children)}</th>;
  },
  table({ children }) {
    return (
      <div className="chat-md-table-wrap">
        <table>{children}</table>
      </div>
    );
  },
  img() {
    return null;
  },
};

export default function ChatMarkdown({ content }: { content: string }) {
  return (
    <div className="chat-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {normalizeChatMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}
