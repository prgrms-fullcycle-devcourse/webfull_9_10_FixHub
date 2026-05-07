import ReactMarkdown from 'react-markdown';

interface IssueMarkdownPreviewProps {
  content: string;
  className?: string;
}

function IssueMarkdown({ content, className = '' }: IssueMarkdownPreviewProps) {
  return (
    <div className={`break-words text-(--text-primary) ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 typo-medium-40 text-(--text-primary)">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 typo-semibold-18 text-(--text-primary)">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-3 typo-medium-16 text-(--text-primary)">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 whitespace-pre-wrap typo-regular-16 text-(--text-primary)">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 list-disc pl-6 typo-regular-16 text-(--text-primary)">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal pl-6 typo-regular-16 text-(--text-primary)">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="mb-1 typo-regular-16 text-(--text-primary)">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-(--text-primary)">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-(--text-primary)">{children}</em>
          ),
          code: ({ children }) => (
            <code className="rounded-sm bg-(--surface-selected) px-1.5 py-0.5 typo-regular-14 text-(--text-primary)">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="mb-4 overflow-x-auto rounded-md bg-(--surface-input) p-4 typo-regular-14 text-(--text-primary)">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-4 border-l-4 border-primary pl-4 typo-regular-16 text-(--text-secondary)">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default IssueMarkdown;
