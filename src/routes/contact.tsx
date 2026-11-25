import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Loader2, Mail, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { PageWithOutline, type OutlineSection } from "@/components/site/page-outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { contactInquirySchema, submitContactInquiry } from "@/lib/contact.functions";

const SUPPORT_EMAIL = "support@auctusperformance.com";

const CONTACT_OUTLINE: OutlineSection[] = [
  { id: "contact-details", label: "Support Details" },
  { id: "contact-form", label: "Send Inquiry" },
];

const TRAINING_GOALS = [
  "1-on-1 Discovery Call / Plan Fit",
  "6–8 Week Health & Performance Program / Nutrition",
  "Basketball Shooting & Court Speed",
  "Sprint Acceleration & Track Mechanics",
  "Strength, Power & Injury Prevention",
  "Team / Program Licensing",
  "Billing & Technical Support",
];

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Support — Auctus Performance" },
      {
        name: "description",
        content:
          "Reach Auctus Performance coaching and athlete support for program consultations, plan guidance, or account help.",
      },
      { property: "og:title", content: "Contact & Support — Auctus Performance" },
      {
        property: "og:description",
        content: "Send a training or nutrition consultation inquiry to Auctus Performance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const sendInquiry = useServerFn(submitContactInquiry);
  const [goal, setGoal] = useState(TRAINING_GOALS[0]!);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<{
    referenceId: string;
    name: string;
    email: string;
    goal: string;
  } | null>(null);

  async function copySupportEmail() {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      toast.success("Support email copied to clipboard.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.info(`Email us directly at ${SUPPORT_EMAIL}`);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      goal,
      message: String(fd.get("message") ?? ""),
    };

    const parsed = contactInquirySchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      toast.error(parsed.error.issues[0]?.message ?? "Please check the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await sendInquiry({ data: parsed.data });
      setConfirmation({
        referenceId: res.referenceId,
        name: parsed.data.name,
        email: parsed.data.email,
        goal: parsed.data.goal,
      });
      form.reset();
      toast.success("Inquiry received — a coach will reply within 1 business day.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not send message right now.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageWithOutline sections={CONTACT_OUTLINE} title="Contact">
      <div className="py-4 sm:py-8">
        <span className="block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
        <div className="mt-6 grid gap-12 lg:grid-cols-[0.95fr_1.2fr]">
          <section id="contact-details" className="scroll-mt-24">
            <p className="eyebrow">Contact &amp; Support</p>
            <h1 className="text-display mt-4 text-4xl sm:text-5xl md:text-6xl">
              Let&apos;s map out your next training block.
            </h1>
            <p className="mt-5 max-w-lg text-base font-light leading-relaxed text-muted-foreground">
              Whether you&apos;re deciding between Basic, Pro, or Unlimited, scheduling a discovery
              call, or need help with a video submission, our coaching and support staff responds
              within one business day.
            </p>

            <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Direct Support Email</p>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="mt-2 inline-flex items-center gap-2 text-base font-medium text-foreground hover:text-brand-amber"
                  >
                    <Mail className="size-4 text-brand-amber" aria-hidden="true" />
                    {SUPPORT_EMAIL}
                  </a>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Monday – Friday · Typical reply under 24 hours
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copySupportEmail}
                  aria-label={copied ? "Support email copied" : "Copy support email"}
                  className="size-11 shrink-0"
                >
                  {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-surface/50 p-6 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Looking for plan comparison first?</p>
              <p className="mt-1 font-light">
                Compare sport filter limits, AI review quotas, and monthly vs annual savings before
                subscribing.
              </p>
              <Link
                to="/pricing"
                className="mt-3 inline-block font-medium text-brand-amber underline underline-offset-4 hover:text-foreground"
              >
                View Plans &amp; Pricing →
              </Link>
            </div>
          </section>

          <section
            id="contact-form"
            className="scroll-mt-24 rounded-2xl border border-border bg-surface p-6 sm:p-8"
          >
            {confirmation ? (
              <div className="py-8" role="status" aria-live="polite">
                <span className="grid size-12 place-items-center rounded-full border border-brand-amber/50 text-brand-amber">
                  <Check className="size-5" aria-hidden="true" />
                </span>
                <p className="eyebrow mt-6 text-brand-amber">
                  Inquiry Confirmed · {confirmation.referenceId}
                </p>
                <h2 className="text-display mt-3 text-3xl text-foreground">
                  We&apos;ve got your message, {confirmation.name.split(" ")[0]}.
                </h2>
                <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
                  Our coaching team received your request regarding{" "}
                  <span className="font-medium text-foreground">{confirmation.goal}</span> and will
                  follow up at{" "}
                  <span className="font-medium text-foreground">{confirmation.email}</span>.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button
                    type="button"
                    variant="hero"
                    size="lg"
                    className="min-h-11 w-full sm:w-auto"
                    onClick={() => setConfirmation(null)}
                  >
                    Send another message
                  </Button>
                  <Button asChild variant="glass" size="lg" className="min-h-11 w-full sm:w-auto">
                    <Link to="/pricing">Browse plans</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <p className="eyebrow">Send an Inquiry</p>
                  <h2 className="text-display mt-2 text-3xl text-foreground">
                    Book a call or ask a coach
                  </h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Full name</Label>
                    <Input
                      id="contact-name"
                      name="name"
                      autoComplete="name"
                      placeholder="Jordan Ellis"
                      maxLength={80}
                      className="h-11"
                      aria-invalid={Boolean(errors["name"])}
                    />
                    {errors["name"] && <p className="text-xs text-destructive">{errors["name"]}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email address</Label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="athlete@example.com"
                      maxLength={255}
                      className="h-11"
                      aria-invalid={Boolean(errors["email"])}
                    />
                    {errors["email"] && (
                      <p className="text-xs text-destructive">{errors["email"]}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-goal">Primary training goal</Label>
                  <Select value={goal} onValueChange={setGoal}>
                    <SelectTrigger
                      id="contact-goal"
                      aria-label="Primary training goal"
                      className="h-11"
                    >
                      <SelectValue placeholder="Choose a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRAINING_GOALS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-message">Goal / Message</Label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    maxLength={2000}
                    placeholder="Share your sport, current schedule, equipment access, or preferred call times..."
                    aria-invalid={Boolean(errors["message"])}
                  />
                  {errors["message"] && (
                    <p className="text-xs text-destructive">{errors["message"]}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="xl"
                  className="min-h-12 w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden="true" /> Sending inquiry…
                    </>
                  ) : (
                    <>
                      Send inquiry <Send className="size-4" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </section>
        </div>
      </div>
    </PageWithOutline>
  );
}
