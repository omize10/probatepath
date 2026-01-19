'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type CallbackStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Phone, CheckCircle, XCircle, ArrowRight, FileText } from "lucide-react";

interface CallbackActionsProps {
  callbackId: string;
  currentStatus: CallbackStatus;
  hasIntakeData: boolean;
  intakePushed: boolean;
}

export function CallbackActions({
  callbackId,
  currentStatus,
  hasIntakeData,
  intakePushed,
}: CallbackActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [retellJson, setRetellJson] = useState("");
  const [isManualIntake, setIsManualIntake] = useState(false);
  const [callNotes, setCallNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (newStatus: CallbackStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ops/callbacks/${callbackId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteCall = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let retellIntakeData = null;
      if (retellJson.trim() && !isManualIntake) {
        try {
          retellIntakeData = JSON.parse(retellJson);
        } catch {
          throw new Error("Invalid JSON format");
        }
      }

      const response = await fetch(`/api/ops/callbacks/${callbackId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          retellIntakeData,
          manualIntake: isManualIntake,
          callNotes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to complete call");
      }

      setShowCompleteModal(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushIntake = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ops/callbacks/${callbackId}/push-intake`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to push intake");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[color:var(--brand)]">Actions</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {currentStatus === "scheduled" && (
          <Button
            className="w-full justify-start"
            onClick={() => updateStatus("call_in_progress")}
            disabled={isLoading}
          >
            <Phone className="mr-2 h-4 w-4" />
            Start Call
          </Button>
        )}

        {currentStatus === "call_in_progress" && (
          <Button
            className="w-full justify-start"
            onClick={() => setShowCompleteModal(true)}
            disabled={isLoading}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark Call Complete
          </Button>
        )}

        {currentStatus === "call_complete" && hasIntakeData && !intakePushed && (
          <Button
            className="w-full justify-start"
            onClick={handlePushIntake}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            Push to Estate System
          </Button>
        )}

        {currentStatus === "scheduled" && (
          <>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => updateStatus("no_show")}
              disabled={isLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Mark No Show
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => updateStatus("cancelled")}
              disabled={isLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Callback
            </Button>
          </>
        )}

        {currentStatus === "call_complete" && !hasIntakeData && (
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowCompleteModal(true)}
            disabled={isLoading}
          >
            <FileText className="mr-2 h-4 w-4" />
            Add Intake Data
          </Button>
        )}
      </div>

      {/* Complete Call Modal */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[color:var(--brand)]">
              Complete Call
            </DialogTitle>
            <DialogDescription>
              Paste the Retell AI JSON output or mark as manual intake.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="manualIntake"
                checked={isManualIntake}
                onChange={(e) => setIsManualIntake(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="manualIntake" className="text-sm text-[color:var(--ink)]">
                Manual intake - no JSON data
              </label>
            </div>

            {!isManualIntake && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[color:var(--brand)]">
                  Retell AI JSON Output
                </label>
                <textarea
                  value={retellJson}
                  onChange={(e) => setRetellJson(e.target.value)}
                  placeholder='{"callId": "...", "intakeData": {...}}'
                  className="h-48 w-full rounded-xl border border-[color:var(--border-muted)] p-3 text-sm font-mono"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[color:var(--brand)]">
                Call Notes (optional)
              </label>
              <textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Any additional notes about the call..."
                className="h-24 w-full rounded-xl border border-[color:var(--border-muted)] p-3 text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteCall} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Complete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
