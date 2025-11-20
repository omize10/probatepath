'use client';

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function SignInPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      toast({ title: "Enter an email", intent: "warning" });
      return;
    }
    setLoading(true);
    const result = await signIn("email", {
      email: email.trim(),
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      toast({ title: "Unable to send link", description: result.error, intent: "error" });
      return;
    }
    toast({
      title: "Check your inbox",
      description: "We sent a magic link to sign in securely.",
      intent: "success",
    });
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="space-y-4">
        <Badge variant="outline">
          Portal access
        </Badge>
        <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">Sign in to your secure portal</h1>
        <p className="max-w-2xl text-base text-[#333333]">
          We store your information in your browser only. Use the same device to resume drafts and follow the assemble & file workflow.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-8 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.25)] sm:max-w-xl"
      >
        <label htmlFor="signin-email" className="text-sm font-semibold text-[color:var(--brand)]">
          Email
        </label>
        <Input
          id="signin-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving…" : "Continue"}
        </Button>
        <p className="text-xs text-[#445266]">
          By continuing you confirm ProbatePath provides document preparation only and executors remain self-represented.
        </p>
      </form>
    </div>
  );
}
