import Markdown, { type Components } from "react-markdown";
import "./journal.css";

// Article bodies are Markdown written in the admin. react-markdown escapes
// any raw HTML rather than rendering it and strips unsafe link protocols
// (javascript: etc.), so what an article can contain is limited to the
// formatting below.
const components: Components = {
  a({ href, children }) {
    // Links out of the site open in a new tab; links within it stay put.
    const external = typeof href === "string" && /^https?:\/\//i.test(href);
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  },
  img({ src, alt }) {
    if (typeof src !== "string") return null;
    // Inline images are uploaded from the admin editor; their size isn't known
    // up front, so a plain <img> (rather than next/image) is the right tool.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt ?? ""} loading="lazy" />;
  },
};

export default function JournalBody({ markdown }: { markdown: string }) {
  return (
    <div className="journal-prose">
      <Markdown components={components}>{markdown}</Markdown>
    </div>
  );
}
