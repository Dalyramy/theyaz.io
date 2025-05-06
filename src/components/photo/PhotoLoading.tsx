
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type PhotoLoadingVariant = "grid" | "detail" | "compact";

interface PhotoLoadingProps {
  count?: number;
  variant?: PhotoLoadingVariant;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

const PhotoLoading = ({ 
  count = 8, 
  variant = "grid",
  columns = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4
  }
}: PhotoLoadingProps) => {
  // Generate responsive grid classes
  const gridClasses = `grid grid-cols-${columns.sm} gap-6 
    ${columns.md ? `sm:grid-cols-${columns.md}` : ''} 
    ${columns.lg ? `lg:grid-cols-${columns.lg}` : ''} 
    ${columns.xl ? `xl:grid-cols-${columns.xl}` : ''}`.replace(/\s+/g, ' ').trim();

  if (variant === "detail") {
    return (
      <div className="space-y-8">
        <Skeleton className="aspect-video w-full max-h-[600px] rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default grid variant
  return (
    <div className={gridClasses}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-0">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          </CardContent>
          <CardFooter className="px-4 pb-4 pt-0 justify-between">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default PhotoLoading;
