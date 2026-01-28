"use client"

import { cn } from "@/lib/utils"
import { memo, useMemo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"

export type ChatMarkdownProps = {
  children: string
  className?: string
}

type MarkdownComponentProps = {
  children?: React.ReactNode
  className?: string
  href?: string
  node?: any
  [key: string]: any
}

const MARKDOWN_COMPONENTS = {
  // Code blocks
  code: function CodeComponent({ className, children, ...props }: MarkdownComponentProps) {
    const isInline = !className

    if (isInline) {
      return (
        <code
          className={cn(
            "relative rounded-md bg-primary/10 px-[0.4em] py-[0.2em] font-mono text-[0.9em] font-medium text-primary",
            className
          )}
          {...props}
        >
          {children}
        </code>
      )
    }

    return (
      <code
        className={cn(
          "block rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto",
          className
        )}
        {...props}
      >
        {children}
      </code>
    )
  },
  pre: function PreComponent({ children }: MarkdownComponentProps) {
    return <>{children}</>
  },
  // Headings
  h1: ({ children, className, ...props }: MarkdownComponentProps) => (
    <h1
      className={cn(
        "mt-4 mb-3 text-xl font-bold tracking-tight text-foreground first:mt-0",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, className, ...props }: MarkdownComponentProps) => (
    <h2
      className={cn(
        "mt-4 mb-2 text-lg font-semibold tracking-tight text-foreground first:mt-0",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, className, ...props }: MarkdownComponentProps) => (
    <h3
      className={cn(
        "mt-3 mb-2 text-base font-semibold text-foreground first:mt-0",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  ),
  // Paragraphs
  p: ({ children, className, ...props }: MarkdownComponentProps) => (
    <p
      className={cn(
        "mb-3 leading-relaxed text-foreground/90 last:mb-0",
        className
      )}
      {...props}
    >
      {children}
    </p>
  ),
  // Lists
  ul: ({ children, className, ...props }: MarkdownComponentProps) => (
    <ul
      className={cn(
        "my-3 ml-5 list-disc space-y-1 text-foreground/90 [&>li]:pl-1",
        className
      )}
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, className, ...props }: MarkdownComponentProps) => (
    <ol
      className={cn(
        "my-3 ml-5 list-decimal space-y-1 text-foreground/90 [&>li]:pl-1",
        className
      )}
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, className, ...props }: MarkdownComponentProps) => (
    <li className={cn("leading-relaxed", className)} {...props}>
      {children}
    </li>
  ),
  // Blockquote
  blockquote: ({ children, className, ...props }: MarkdownComponentProps) => (
    <blockquote
      className={cn(
        "my-3 border-l-4 border-primary/40 bg-muted/30 py-2 pl-4 pr-4 italic text-foreground/80 rounded-r-lg",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  ),
  // Links
  a: ({ children, className, href, ...props }: MarkdownComponentProps) => (
    <a
      className={cn(
        "font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary",
        className
      )}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  // Strong/Bold
  strong: ({ children, className, ...props }: MarkdownComponentProps) => (
    <strong
      className={cn("font-semibold text-foreground", className)}
      {...props}
    >
      {children}
    </strong>
  ),
  // Emphasis/Italic
  em: ({ children, className, ...props }: MarkdownComponentProps) => (
    <em className={cn("italic", className)} {...props}>
      {children}
    </em>
  ),
  // Horizontal Rule
  hr: ({ className, ...props }: MarkdownComponentProps) => (
    <hr className={cn("my-4 border-border/50", className)} {...props} />
  ),
  // Tables
  table: ({ children, className, ...props }: MarkdownComponentProps) => (
    <div className="my-3 w-full overflow-x-auto rounded-lg border border-border/50">
      <table
        className={cn("w-full border-collapse text-sm", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, className, ...props }: MarkdownComponentProps) => (
    <thead
      className={cn("bg-muted/50 text-left font-semibold", className)}
      {...props}
    >
      {children}
    </thead>
  ),
  tbody: ({ children, className, ...props }: MarkdownComponentProps) => (
    <tbody className={cn("divide-y divide-border/50", className)} {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, className, ...props }: MarkdownComponentProps) => (
    <tr
      className={cn("transition-colors hover:bg-muted/30", className)}
      {...props}
    >
      {children}
    </tr>
  ),
  th: ({ children, className, ...props }: MarkdownComponentProps) => (
    <th
      className={cn(
        "px-4 py-2 text-left text-foreground font-semibold",
        className
      )}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, className, ...props }: MarkdownComponentProps) => (
    <td className={cn("px-4 py-2 text-foreground/90", className)} {...props}>
      {children}
    </td>
  ),
}

function ChatMarkdown({ children, className }: ChatMarkdownProps) {
  const content = useMemo(() => children || "", [children])

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={MARKDOWN_COMPONENTS as any}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default memo(ChatMarkdown)
