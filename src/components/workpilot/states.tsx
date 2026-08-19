import { AlertTriangle, Loader2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="surface-card grid place-items-center gap-3 p-10 text-center">
      <Loader2 className="size-6 animate-spin text-primary" />
      <p className="text-sm font-medium">{label}</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        WorkPilot AI is structuring your input. This usually takes a few seconds.
      </p>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="surface-card grid place-items-center gap-3 p-10 text-center">
      <span className="grid size-11 place-items-center rounded-xl bg-secondary text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <p className="text-sm font-semibold">{title}</p>
      <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-destructive">Something didn't work</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <Button size="sm" variant="outline" className="mt-3" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
