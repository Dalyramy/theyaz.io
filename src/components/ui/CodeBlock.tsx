import React from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  children, 
  className, 
  language = 'text' 
}) => {
  return (
    <div className={cn('relative rounded-lg border bg-muted p-4', className)}>
      {language && (
        <div className="absolute -top-2 left-4 bg-background px-2 text-xs font-mono text-muted-foreground">
          {language}
        </div>
      )}
      <pre className="font-mono text-sm leading-relaxed">
        <code className="block overflow-x-auto">
          {children}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock; 