import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, LogOut, Menu, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "./logo";

const navLinkClass =
  "whitespace-nowrap shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm";

const mobileNavLinkClass =
  "flex min-h-11 items-center whitespace-nowrap text-base font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground";

const NAV_ITEMS = [
  { to: "/dashboard" as const, label: "Training" },
  { to: "/nutrition" as const, label: "Nutrition" },
  { to: "/articles" as const, label: "Latest Science" },
  { to: "/submit" as const, label: "AI Video" },
  { to: "/pricing" as const, label: "Pricing" },
];

export function SiteHeader() {
  const { session, ready } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    setOpen(false);
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:gap-6 md:px-8">
        <div className="shrink-0">
          <Logo />
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex xl:gap-7">
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {ready && session ? (
            <>
              <Button
                asChild
                variant="hero"
                size="sm"
                className="hidden min-h-10 shrink-0 whitespace-nowrap sm:inline-flex"
              >
                <Link to="/contact">Book a Call</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="glass"
                    size="sm"
                    className="min-h-10 shrink-0 gap-2 whitespace-nowrap"
                    aria-label="Open account menu"
                  >
                    <User aria-hidden="true" />
                    <span className="hidden max-w-[9rem] truncate sm:inline">
                      {session.user.user_metadata?.["display_name"] ?? session.user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate text-xs font-medium text-muted-foreground">
                    {session.user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate({ to: "/dashboard" })}>
                    Training Library
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate({ to: "/submit" })}>
                    AI Video Analysis
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate({ to: "/nutrition" })}>
                    Nutrition Hub
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate({ to: "/articles" })}>
                    Latest Science
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate({ to: "/membership" })}>
                    Membership &amp; Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate({ to: "/admin" })}>
                    <KeyRound className="size-4" aria-hidden="true" /> Admin Studio
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={signOut}>
                    <LogOut className="size-4" aria-hidden="true" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {ready && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden min-h-10 shrink-0 whitespace-nowrap sm:inline-flex"
                >
                  <Link to="/auth">Sign in</Link>
                </Button>
              )}
              <Button
                asChild
                variant="hero"
                size="sm"
                className="min-h-10 shrink-0 whitespace-nowrap px-4"
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  Join Now
                </Link>
              </Button>
            </>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-11 lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-72 flex-col justify-between">
              <div>
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <nav aria-label="Mobile" className="mt-10 flex flex-col gap-2">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={mobileNavLinkClass}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link to="/about" className={mobileNavLinkClass} onClick={() => setOpen(false)}>
                    About
                  </Link>
                  <Link to="/contact" className={mobileNavLinkClass} onClick={() => setOpen(false)}>
                    Contact
                  </Link>
                  <Link to="/admin" className={mobileNavLinkClass} onClick={() => setOpen(false)}>
                    Admin Studio
                  </Link>
                </nav>
              </div>

              <div className="space-y-3 border-t border-border pt-6">
                {session ? (
                  <>
                    <Button
                      asChild
                      variant="hero"
                      size="lg"
                      className="min-h-11 w-full"
                      onClick={() => setOpen(false)}
                    >
                      <Link to="/contact">Book a Call</Link>
                    </Button>
                    <Button
                      type="button"
                      variant="glass"
                      size="lg"
                      className="min-h-11 w-full"
                      onClick={signOut}
                    >
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="hero"
                      size="lg"
                      className="min-h-11 w-full"
                      onClick={() => setOpen(false)}
                    >
                      <Link to="/auth" search={{ mode: "signup" }}>
                        Join Now
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="glass"
                      size="lg"
                      className="min-h-11 w-full"
                      onClick={() => setOpen(false)}
                    >
                      <Link to="/auth">Sign in</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
