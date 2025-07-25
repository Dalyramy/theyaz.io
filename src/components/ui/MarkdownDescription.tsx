import ReactMarkdown from 'react-markdown';

export default function MarkdownDescription({ children }: { children: string }) {
  return <ReactMarkdown>{children}</ReactMarkdown>;
} 