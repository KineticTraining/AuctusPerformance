import { Link } from "@tanstack/react-router";
import { ArrowLeft, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <section className="relative isolate flex min-h-[75vh] items-center justify-center overflow-hidden bg-grid px-5 py-20">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
        <p className="eyebrow mt-6">Off the court</p>
        <h1 className="text-display mt-3 text-7xl font-extralight text-foreground sm:text-8xl">
          404
        </h1>
        <h2 className="text-display mt-4 text-3xl text-foreground sm:text-4xl">Page not found</h2>
        <p className="mt-4 text-base font-light leading-relaxed text-muted-foreground">
          The drill, article, or route you requested isn&apos;t in the playbook anymore or the URL
          was mistyped. Head back to the home court or open the training library.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="hero" size="xl" className="min-h-12">
            <Link to="/">
              <ArrowLeft className="size-4" aria-hidden="true" /> Back to Homepage
            </Link>
          </Button>
          <Button asChild variant="glass" size="xl" className="min-h-12">
            <Link to="/training">
              <PlayCircle className="size-4" aria-hidden="true" /> Training &amp; Workout Builder
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
