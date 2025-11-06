'use client';

import { FormEvent, useState } from "react";
import Image from "next/image";
import { CTAPanel } from "@/components/cta-panel";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

type StartFields = {
  name: string;
  email: string;
  phone: string;
  notes: string;
};

const initialState: StartFields = {
  name: "",
  email: "",
  phone: "",
  notes: "",
};

const nextSteps = [
  "We review your summary and confirm the estate fits the fixed fee.",
  "You receive a secure link to complete the full intake questionnaire.",
  "Documents are assembled and delivered shortly after intake is complete.",
];

export function StartForm() {
  const [formData, setFormData] = useState<StartFields>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof StartFields, string>>>({});
  const { toast } = useToast();

  const handleChange = <Key extends keyof StartFields>(key: Key, value: StartFields[Key]) => {
    setFormData((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof StartFields, string>> = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Please share your full name.";
    }
    if (!formData.email.trim()) {
      nextErrors.email = "An email address lets us send intake details.";
    }
    if (!formData.notes.trim()) {
      nextErrors.notes = "A short summary helps us confirm scope.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    toast({
      title: "Thanks! We’ll follow up shortly.",
      description: "Expect a response from our probate specialists within one business day.",
      intent: "success",
    });

    setFormData(initialState);
    setErrors({});
  };

  return (
    <Section className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-white/12 bg-[#111217]/85 p-8 shadow-[0_40px_120px_-70px_rgba(0,0,0,0.85)]"
        noValidate
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="start-name" className="text-sm font-semibold text-slate-200">
              Full name
            </label>
            <Input
              id="start-name"
              value={formData.name}
              autoComplete="name"
              placeholder="Jordan Smith"
              onChange={(event) => handleChange("name", event.target.value)}
              required
            />
            {errors.name ? <p className="text-xs text-[#ffb703]">{errors.name}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="start-email" className="text-sm font-semibold text-slate-200">
              Email
            </label>
            <Input
              id="start-email"
              type="email"
              value={formData.email}
              autoComplete="email"
              placeholder="you@example.com"
              onChange={(event) => handleChange("email", event.target.value)}
              required
            />
            {errors.email ? <p className="text-xs text-[#ffb703]">{errors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="start-phone" className="text-sm font-semibold text-slate-200">
              Phone (optional)
            </label>
            <Input
              id="start-phone"
              value={formData.phone}
              autoComplete="tel"
              placeholder="604-555-0199"
              onChange={(event) => handleChange("phone", event.target.value)}
            />
            <p className="text-xs text-slate-400">Helpful if we need quick clarification.</p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="start-notes" className="text-sm font-semibold text-slate-200">
            Estate summary
          </label>
          <Textarea
            id="start-notes"
            value={formData.notes}
            rows={4}
            placeholder="Share a brief overview: will date, executor details, approximate estate value, and any complexities we should know about."
            onChange={(event) => handleChange("notes", event.target.value)}
            required
          />
          {errors.notes ? <p className="text-xs text-[#ffb703]">{errors.notes}</p> : null}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            We store your information securely in Canada. Nothing is filed or shared without your permission.
          </p>
          <Button type="submit" size="lg" className="min-w-[200px]">
            Submit details
          </Button>
        </div>
      </form>

      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#111217]">
          <Image
            src="/images/start-intake.svg"
            alt="Executor preparing probate intake documents with a laptop"
            width={520}
            height={420}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/40" />
        </div>

        <Card className="border-white/12 bg-[#111217]/80">
          <CardHeader>
            <CardTitle className="text-xl text-white">What happens next</CardTitle>
            <CardDescription>
              A friendly outline of the steps once you submit the form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 pl-5 text-sm text-slate-200">
              {nextSteps.map((step) => (
                <li key={step} className="list-decimal">
                  {step}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <CTAPanel
          eyebrow="Need help?"
          title="Prefer email or a quick call?"
          description="Send details to hello@probatepath.ca or request a callback. We keep communication calm and pressure-free."
          primaryAction={{ label: "Contact us", href: "/contact" }}
          secondaryAction={{ label: "How it works", href: "/how-it-works", variant: "ghost" }}
        />
      </div>
    </Section>
  );
}
