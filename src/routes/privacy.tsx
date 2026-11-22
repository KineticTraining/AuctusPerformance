import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Dusk Kinetic Performance" },
      {
        name: "description",
        content:
          "How Dusk Kinetic Performance handles athlete account profiles, submitted video links, Stripe billing records, and cookie preferences.",
      },
      { property: "og:title", content: "Privacy Policy — Dusk Kinetic Performance" },
      {
        property: "og:description",
        content: "Privacy and video submission data handling at Dusk Kinetic Performance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
      <span className="block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
      <p className="eyebrow mt-6">Privacy · Updated November 2026</p>
      <h1 className="text-display mt-3 text-4xl md:text-6xl">Privacy Policy</h1>
      <p className="mt-4 text-base font-light leading-relaxed text-muted-foreground">
        This Privacy Policy explains what information Dusk Kinetic Performance collects, how your
        training footage links and coaching notes are processed, and how you control your data.
      </p>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-foreground/85 md:text-base">
        <section className="space-y-3">
          <h2 className="text-display text-2xl text-foreground">1. Account &amp; Profile Data</h2>
          <p className="font-light text-muted-foreground">
            When you create an account, we store your name, email address, primary sport, skill
            level, age group, and active membership tier so the Training Library and AI feedback
            adapt to your profile.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-display text-2xl text-foreground">
            2. Training Video Links &amp; AI Review Processing
          </h2>
          <p className="font-light text-muted-foreground">
            When you submit a training video URL and coaching notes, those inputs are sent
            exclusively to our server-side technique review service to evaluate movement mechanics
            against our drill database and generate structured strengths, cues, and drill
            recommendations. Dusk Kinetic never sells athlete video links or training notes to
            third-party advertisers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-display text-2xl text-foreground">
            3. Payment &amp; Billing Security
          </h2>
          <p className="font-light text-muted-foreground">
            All subscription and cohort payments are processed directly by Stripe. Dusk Kinetic does
            not collect or store raw credit card numbers on our servers—we only retain Stripe
            customer/subscription identifiers and current plan status to enforce your benefits.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-display text-2xl text-foreground">
            4. Cookies &amp; Local Preferences
          </h2>
          <p className="font-light text-muted-foreground">
            Essential authentication storage keeps you signed in cleanly. Optional cookie consent
            choices (
            <code className="font-mono text-xs text-foreground">kinetic_cookie_consent</code>) are
            saved directly in your browser&apos;s local storage so our banner respects your Accept
            or Decline selection on future visits.
          </p>
        </section>

        <section className="space-y-3 border-t border-border pt-8">
          <h2 className="text-display text-2xl text-foreground">
            5. Data Deletion &amp; Questions
          </h2>
          <p className="font-light text-muted-foreground">
            To request an export or permanent deletion of your profile and review history, email{" "}
            <a
              href="mailto:support@duskkinetic.com"
              className="text-foreground underline underline-offset-4 hover:text-brand-amber"
            >
              support@duskkinetic.com
            </a>{" "}
            or submit a request through our{" "}
            <Link
              to="/contact"
              className="text-foreground underline underline-offset-4 hover:text-brand-amber"
            >
              Contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
