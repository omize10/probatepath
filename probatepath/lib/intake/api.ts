import type { IntakeDraft } from "@/lib/intake/types";
import { getClientKey, getMatterId, setMatterId } from "@/lib/intake/session";

const headers = {
  "Content-Type": "application/json",
};

export async function saveIntakeStep(step: string, data: unknown) {
  const clientKey = getClientKey();
  const matterId = getMatterId();
  try {
    const response = await fetch("/api/intake", {
      method: "POST",
      headers,
      body: JSON.stringify({ clientKey, matterId, step, data }),
    });
    if (!response.ok) {
      throw new Error(`Unable to save draft (status ${response.status})`);
    }
    const payload = (await response.json().catch(() => ({}))) as { matterId?: string };
    if (payload?.matterId) {
      setMatterId(payload.matterId);
    }
    return { ...payload, persisted: true };
  } catch (error) {
    // Return a structured fallback so callers can show friendly UI.
    console.warn("[intake] saveIntakeStep failed; using local fallback", error);
    const fallbackMatterId = matterId ?? clientKey;
    if (fallbackMatterId && !matterId) {
      setMatterId(fallbackMatterId);
    }
    return {
      matterId: fallbackMatterId,
      persisted: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function submitIntake(draft: IntakeDraft) {
  const clientKey = getClientKey();
  const matterId = getMatterId();
  const response = await fetch("/api/intake/submit", {
    method: "POST",
    headers,
    body: JSON.stringify({ clientKey, matterId, draft }),
  });
  if (!response.ok) {
    throw new Error("Unable to submit intake");
  }
  return response.json();
}

export async function fetchServerDraft() {
  const clientKey = getClientKey();
  const response = await fetch(`/api/intake?clientKey=${clientKey}`);
  if (!response.ok) {
    return null;
  }
  const payload = await response.json();
  if (payload?.matterId) {
    setMatterId(payload.matterId);
  }
  return payload as { draft: IntakeDraft; matterId: string } | null;
}

export async function saveMatterDraft(matterId: string, payload: IntakeDraft) {
  const response = await fetch("/api/intake/save", {
    method: "POST",
    headers,
    body: JSON.stringify({ matterId, payload }),
  });
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const message = (errorPayload as { error?: string }).error ?? "Failed to save matter intake";
    throw new Error(message);
  }
  return response.json() as Promise<{ persisted: boolean; updatedAt?: string }>;
}
