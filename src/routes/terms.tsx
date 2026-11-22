import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Dusk Kinetic Performance" },
      {
        name: "description",
        content:
          "Terms of service, subscription billing policies, and fitness and medical liability waiver for Dusk Kinetic Performance.",
      },
      { property: "og:title", content: "Terms & Conditions — Dusk Kinetic Performance" },
      {
        property: "og:description",
        content: "Terms, membership rules, and athlete training liability waiver.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
      <span className="block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
      <p className="eyebrow mt-6">Legal · Effective November 2026</p>
      <h1 className="text-display mt-3 text-4xl md:text-6xl">Terms &amp; Conditions</h1>
      <p className="mt-4 text-base font-light leading-relaxed text-muted-foreground">
        Please read these Terms &amp; Conditions carefully before accessing Dusk Kinetic Performance
        training programs, nutrition libraries, sports science articles, or AI video review tools.
      </p>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-foreground/85 md:text-base">
        <section className="rounded-2xl border border-brand-red/40 bg-surface p-6 md:p-8">
          <p className="eyebrow text-brand-red">Important Notice</p>
          <h2 className="text-display mt-2 text-2xl text-foreground">
            1. Fitness, Exercise &amp; Medical Liability Waiver
          </h2>
          <p className="mt-3 font-light text-muted-foreground">
            Dusk Kinetic Performance provides educational athletic training videos, nutrition
            guides, strength and speed progressions, and automated technique feedback for
            informational and coaching purposes only. Nothing on this platform constitutes medical
            advice, physical therapy, diagnosis, or clinical treatment.
          </p>
          <p className="mt-3 font-light text-muted-foreground">
            High-intensity exercise, plyometrics, sprinting, and barbell resistance training carry
            an inherent risk of physical injury. By participating in any drill or training protocol,
            you confirm that you are medically cleared for physical activity, voluntarily assume all
            risks of injury or property damage, and release Dusk Kinetic Performance, its coaches,
            and contributors from liability arising out of voluntary training execution. Stop any
            exercise immediately if you experience pain, dizziness, or shortness of breath and
            consult a qualified healthcare professional.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-display text-2xl text-foreground">
            2. Memberships, Programs &amp; Billing
          </h2>
          <p className="font-light text-muted-foreground">
            Paid memberships (Basic Monthly, Pro Monthly, Unlimited Monthly, Annual Unlimited, and
            Ongoing Nutrition Coaching) renew automatically at the cadence displayed during Stripe
            Checkout until canceled. One-time cohort programs (Custom Macro Blueprint and 6–8 Week
            Health &amp; Performance Program) are billed once at enrollment.
          </p>
          <p className="font-light text-muted-foreground">
            You can upgrade, downgrade, or cancel recurring subscriptions at any time via the Stripe
            Billing Portal inside your Membership page.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-display text-2xl text-foreground">
            3. Athlete Conduct &amp; Submissions
          </h2>
          <p className="font-light text-muted-foreground">
            When submitting training footage URLs for AI technique review, you represent that you
            hold permission to share the clip and that all footage depicts genuine athletic
            training.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-display text-2xl text-foreground">4. Intellectual Property</h2>
          <p className="font-light text-muted-foreground">
            All coaching frameworks, sports science articles, nutrition protocols, UI designs, and
            biomechanical fault taxonomies remain the property of Dusk Kinetic Performance and may
            not be redistributed commercially without written consent.
          </p>
        </section>

        <section className="space-y-3 border-t border-border pt-8">
          <h2 className="text-display text-2xl text-foreground">5. Contact</h2>
          <p className="font-light text-muted-foreground">
            Questions about these terms or billing support can be sent to{" "}
            <a
              href="mailto:support@duskkinetic.com"
              className="text-foreground underline underline-offset-4 hover:text-brand-amber"
            >
              support@duskkinetic.com
            </a>{" "}
            or via our{" "}
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
