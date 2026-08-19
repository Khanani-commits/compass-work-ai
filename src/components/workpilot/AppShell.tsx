import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarClock,
  History,
  LayoutDashboard,
  Mail,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  FileText,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/summarizer", label: "Meeting Summarizer", icon: FileText },
  { to: "/planner", label: "Task Planner", icon: CalendarClock },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/history", label: "Activity", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-2 py-1">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <Sparkles className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-bold tracking-tight">WorkPilot AI</span>
        <span className="block text-[11px] text-muted-foreground">Workplace copilot</span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DisclaimerNote({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-border bg-accent/50 p-4 text-xs leading-relaxed text-accent-foreground",
        className,
      )}
    >
      <ShieldCheck className="mt-0.5 size-4 shrink-0" />
      <p>
        <strong className="font-semibold">Responsible AI:</strong> AI-generated content may contain
        errors. Always review outputs before using them professionally, never enter confidential,
        sensitive or personal company information, and treat recommendations as suggestions rather
        than a replacement for professional judgement.
      </p>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <Brand />
        <div className="mt-6 flex-1">
          <NavLinks />
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-[11px] leading-relaxed text-muted-foreground">
          Review AI output before sharing. Avoid confidential data.
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-4">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <div className="mt-6">
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-sm font-bold tracking-tight">WorkPilot AI</span>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10">{children}</main>

        <footer className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
          <DisclaimerNote />
          <p className="mt-4 text-center text-xs text-muted-foreground">
            WorkPilot AI — meetings to action items, priorities, schedules and professional
            communication.
          </p>
        </footer>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: typeof Mail;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
