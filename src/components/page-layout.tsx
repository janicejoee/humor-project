import { ReactNode } from "react";

interface PageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function PageLayout({ title, description, children }: PageLayoutProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-muted">{description}</p>
          )}
        </header>
        {children}
      </div>
    </main>
  );
}
