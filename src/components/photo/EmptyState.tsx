
import { SearchX, FileX, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export type EmptyStateVariant = "search" | "error" | "no-content";

interface EmptyStateProps {
  message?: string;
  subMessage?: string;
  variant?: EmptyStateVariant;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const EmptyState = ({ 
  message = "No results found", 
  subMessage,
  variant = "search",
  actionLabel,
  actionLink,
  onAction,
  icon,
  className = "",
}: EmptyStateProps) => {
  const getIcon = () => {
    if (icon) return icon;
    
    switch (variant) {
      case "search":
        return <SearchX className="h-12 w-12 text-muted-foreground/50" />;
      case "error":
        return <FileX className="h-12 w-12 text-destructive/70" />;
      case "no-content":
        return <Frown className="h-12 w-12 text-muted-foreground/50" />;
      default:
        return <SearchX className="h-12 w-12 text-muted-foreground/50" />;
    }
  };

  return (
    <div className={`flex h-[50vh] flex-col items-center justify-center gap-4 text-center px-4 ${className}`}>
      {getIcon()}
      <div className="space-y-2 max-w-md">
        <p className="text-lg font-medium text-foreground">{message}</p>
        {subMessage && <p className="text-sm text-muted-foreground">{subMessage}</p>}
      </div>
      
      {(actionLabel && (actionLink || onAction)) && (
        <div className="mt-4">
          {actionLink ? (
            <Button asChild>
              <Link to={actionLink}>{actionLabel}</Link>
            </Button>
          ) : (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
