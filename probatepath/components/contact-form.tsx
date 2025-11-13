'use client';

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

type ContactFields = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const initialState: ContactFields = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFields>(initialState);
  const { toast } = useToast();

  const handleChange = <Key extends keyof ContactFields>(key: Key, value: ContactFields[Key]) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Message sent.",
      description: "We will respond within one business day.",
      intent: "success",
    });
    setFormData(initialState);
  };

  return (
    <Form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-[#e2e8f0] bg-white p-8 shadow-[0_35px_100px_-60px_rgba(15,23,42,0.35)]"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input
              id="contact-name"
              value={formData.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="Jordan Smith"
              required
            />
          </FormControl>
        </FormItem>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input
              id="contact-email"
              type="email"
              value={formData.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="you@example.com"
              required
            />
          </FormControl>
        </FormItem>
        <FormItem>
          <FormLabel>Phone (optional)</FormLabel>
          <FormControl>
            <Input
              id="contact-phone"
              value={formData.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              placeholder="604-555-0199"
            />
          </FormControl>
          <FormDescription>We call only if needed for intake support.</FormDescription>
        </FormItem>
      </div>
      <FormItem>
        <FormLabel>How can we help?</FormLabel>
        <FormControl>
          <Textarea
            id="contact-message"
            value={formData.message}
            onChange={(event) => handleChange("message", event.target.value)}
            rows={5}
            placeholder="Share any details about the estate, timeline, or questions so we can prepare a helpful response."
            required
          />
        </FormControl>
      </FormItem>
      <div className="flex flex-col gap-3 border-t border-[#e2e8f0] pt-6 text-sm text-[#495067] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[#6b7280]">
          We respect your privacy. Information is stored securely in Canada and never shared without permission.
        </p>
        <Button type="submit" size="lg" className="min-w-[200px]">
          Send message
        </Button>
      </div>
    </Form>
  );
}
