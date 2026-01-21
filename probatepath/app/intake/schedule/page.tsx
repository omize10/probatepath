'use client';

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Calendar,
  Clock,
  Phone,
  Upload,
  X,
  Check,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Loader2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES,
} from "@/types/pricing";

// Get current Pacific Time for display
function getPacificTimeString(): string {
  return new Date().toLocaleTimeString("en-US", {
    timeZone: "America/Vancouver",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface UploadedDocument {
  id: string;
  filename: string;
  fileType: "pdf" | "image";
  thumbnailUrl?: string;
  qualityScore?: number;
  qualityWarnings: string[];
  fileSize: number;
  isUploading?: boolean;
}

interface AvailableSlot {
  date: string;
  times: string[];
}

export default function CallbackSchedulePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [callbackScheduleId, setCallbackScheduleId] = useState<string | null>(null);

  // Document uploads
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Availability state
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  // Fetch available slots on mount
  useEffect(() => {
    async function fetchAvailability() {
      try {
        const response = await fetch("/api/availability");
        if (response.ok) {
          const data = await response.json();
          setAvailableSlots(data.available || []);
        }
      } catch (err) {
        console.error("Failed to fetch availability:", err);
      } finally {
        setLoadingAvailability(false);
      }
    }
    fetchAvailability();
  }, []);

  // Get available dates from fetched slots
  const availableDates = availableSlots.map((slot) => slot.date);

  // Get available times for selected date
  const availableTimes = selectedDate
    ? availableSlots.find((slot) => slot.date === selectedDate)?.times || []
    : [];

  // Reset time when date changes if the selected time is no longer available
  useEffect(() => {
    if (selectedTime && !availableTimes.includes(selectedTime)) {
      setSelectedTime("");
    }
  }, [selectedDate, availableTimes, selectedTime]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-CA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploadError(null);

    // Check total file count
    if (documents.length + acceptedFiles.length > MAX_FILES) {
      setUploadError(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    // Process each file
    for (const file of acceptedFiles) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`${file.name} is too large. Maximum size is 20MB`);
        continue;
      }

      // Add placeholder document
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const newDoc: UploadedDocument = {
        id: tempId,
        filename: file.name,
        fileType: file.type === "application/pdf" ? "pdf" : "image",
        qualityWarnings: [],
        fileSize: file.size,
        isUploading: true,
      };

      setDocuments((prev) => [...prev, newDoc]);

      // If we have a callback schedule ID, upload immediately
      if (callbackScheduleId) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("callbackScheduleId", callbackScheduleId);

          const response = await fetch("/api/will/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Upload failed");
          }

          const { document } = await response.json();

          // Update document with server response
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === tempId
                ? {
                    ...document,
                    isUploading: false,
                  }
                : doc
            )
          );
        } catch (err) {
          // Remove failed upload
          setDocuments((prev) => prev.filter((doc) => doc.id !== tempId));
          setUploadError(err instanceof Error ? err.message : "Upload failed");
        }
      } else {
        // Mark as not uploading but pending (will upload after schedule is created)
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === tempId ? { ...doc, isUploading: false, file } : doc
          )
        );
      }
    }
  }, [documents.length, callbackScheduleId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES - documents.length,
  });

  const removeDocument = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;

    // If it's been uploaded to server, delete it
    if (!doc.id.startsWith("temp-")) {
      try {
        await fetch(`/api/will/upload?id=${id}`, { method: "DELETE" });
      } catch (err) {
        console.error("Failed to delete document:", err);
      }
    }

    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const getQualityIcon = (score?: number) => {
    if (!score) return null;
    if (score >= 80) return <Check className="h-4 w-4 text-green-600" />;
    if (score >= 50) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const getQualityColor = (score?: number) => {
    if (!score) return "border-gray-200";
    if (score >= 80) return "border-green-300 bg-green-50";
    if (score >= 50) return "border-yellow-300 bg-yellow-50";
    return "border-red-300 bg-red-50";
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !phoneNumber) {
      setError("Please fill in all required fields");
      return;
    }

    if (documents.length === 0) {
      setError("Please upload at least one will document");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create the callback schedule
      const scheduleResponse = await fetch("/api/callback/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          phoneNumber,
        }),
      });

      if (!scheduleResponse.ok) {
        const data = await scheduleResponse.json();
        throw new Error(data.error || "Failed to schedule callback");
      }

      const { callbackScheduleId: newScheduleId } = await scheduleResponse.json();
      setCallbackScheduleId(newScheduleId);

      // Upload any pending documents
      const pendingDocs = documents.filter((d) => d.id.startsWith("temp-"));
      for (const doc of pendingDocs) {
        const docWithFile = doc as UploadedDocument & { file?: File };
        if (docWithFile.file) {
          const formData = new FormData();
          formData.append("file", docWithFile.file);
          formData.append("callbackScheduleId", newScheduleId);

          await fetch("/api/will/upload", {
            method: "POST",
            body: formData,
          });
        }
      }

      // Show confirmation
      setShowConfirmation(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualIntake = async () => {
    // If we have a callback schedule, mark it as manual intake
    if (callbackScheduleId) {
      await fetch("/api/callback/schedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: callbackScheduleId,
          manualIntakeSelected: true,
        }),
      });
    }
    router.push("/portal/intake");
  };

  // Track current Pacific time for display
  const [currentPT, setCurrentPT] = useState<string>("");

  useEffect(() => {
    const updateTime = () => setCurrentPT(getPacificTimeString());
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center">
        <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">
          Let's Get Your Information
        </h1>
        <p className="mx-auto max-w-2xl text-base text-[color:var(--muted-ink)]">
          We'll call you to collect your estate details. It takes about 20-30 minutes, and our team
          will guide you through everything.
        </p>
        {/* Pacific Time indicator */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--bg-muted)] px-4 py-2 text-sm text-[color:var(--muted-ink)]">
          <MapPin className="h-4 w-4" />
          <span>All times shown in Pacific Time (Vancouver)</span>
          {currentPT && (
            <>
              <span className="text-[color:var(--border-muted)]">·</span>
              <span className="font-medium text-[color:var(--brand)]">{currentPT} PT</span>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {/* Section 1: Schedule Your Call */}
        <Card className="border-[color:var(--border-muted)] shadow-[0_30px_80px_-70px_rgba(15,23,42,0.25)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-[color:var(--brand)]">
              <Calendar className="h-6 w-6" />
              Schedule Your Call
            </CardTitle>
            <CardDescription className="text-sm text-[color:var(--muted-ink)]">
              Choose a time that works for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingAvailability ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[color:var(--brand)]" />
                <span className="ml-2 text-sm text-[color:var(--muted-ink)]">
                  Loading available times...
                </span>
              </div>
            ) : availableDates.length === 0 ? (
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-center">
                <Calendar className="mx-auto h-10 w-10 text-yellow-600" />
                <p className="mt-3 font-semibold text-yellow-800">
                  No Availability Right Now
                </p>
                <p className="mt-1 text-sm text-yellow-700">
                  We're fully booked at the moment. Please check back later or{" "}
                  <a
                    href="mailto:support@probatedesk.ca"
                    className="font-medium underline hover:no-underline"
                  >
                    contact us
                  </a>{" "}
                  to be notified when slots open up.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[color:var(--brand)]">
                      <Calendar className="mr-1 inline h-4 w-4" />
                      Select Date
                    </label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="flex h-12 w-full rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] px-4 py-2 text-base text-[color:var(--ink)] focus:border-[color:var(--brand)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
                    >
                      <option value="">Choose a date...</option>
                      {availableDates.map((date) => (
                        <option key={date} value={date}>
                          {formatDate(date)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[color:var(--brand)]">
                      <Clock className="mr-1 inline h-4 w-4" />
                      Select Time (Pacific Time)
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      disabled={!selectedDate}
                      className="flex h-12 w-full rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] px-4 py-2 text-base text-[color:var(--ink)] focus:border-[color:var(--brand)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">
                        {!selectedDate
                          ? "Select a date first..."
                          : availableTimes.length === 0
                          ? "No times available"
                          : "Choose a time..."}
                      </option>
                      {availableTimes.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[color:var(--brand)]">
                    <Phone className="mr-1 inline h-4 w-4" />
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="(604) 555-1234"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <p className="text-xs text-[color:var(--muted-ink)]">
                    We'll call you at this number at your scheduled time.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Upload Your Will */}
        <Card className="border-[color:var(--border-muted)] shadow-[0_30px_80px_-70px_rgba(15,23,42,0.25)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-[color:var(--brand)]">
              <Upload className="h-6 w-6" />
              Upload Your Will
            </CardTitle>
            <CardDescription className="text-sm text-[color:var(--muted-ink)]">
              Upload clear photos or scans of the will document
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {uploadError}
              </div>
            )}

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
                isDragActive
                  ? "border-[color:var(--brand)] bg-[color:var(--bg-muted)]"
                  : "border-[color:var(--border-muted)] hover:border-[color:var(--brand)] hover:bg-[color:var(--bg-muted)]"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-10 w-10 text-[color:var(--slate)]" />
              <p className="mt-3 text-sm font-semibold text-[color:var(--brand)]">
                {isDragActive ? "Drop files here" : "Drag & drop files here, or click to browse"}
              </p>
              <p className="mt-1 text-xs text-[color:var(--muted-ink)]">
                PDF, JPG, PNG, or HEIC • Max 20MB per file • Up to {MAX_FILES} files
              </p>
            </div>

            {/* Uploaded Documents */}
            {documents.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[color:var(--brand)]">
                  Uploaded Documents ({documents.length})
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 ${getQualityColor(
                        doc.qualityScore
                      )}`}
                    >
                      {doc.thumbnailUrl ? (
                        <img
                          src={doc.thumbnailUrl}
                          alt={doc.filename}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : doc.fileType === "pdf" ? (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[color:var(--bg-muted)]">
                          <FileText className="h-6 w-6 text-[color:var(--brand)]" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[color:var(--bg-muted)]">
                          <ImageIcon className="h-6 w-6 text-[color:var(--brand)]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-[color:var(--brand)]">
                          {doc.filename}
                        </p>
                        <div className="flex items-center gap-2">
                          {doc.isUploading ? (
                            <span className="text-xs text-[color:var(--muted-ink)]">
                              Uploading...
                            </span>
                          ) : (
                            <>
                              {getQualityIcon(doc.qualityScore)}
                              {doc.qualityWarnings.length > 0 && (
                                <span className="text-xs text-yellow-700">
                                  {doc.qualityWarnings[0]}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="flex-none rounded-full p-1 hover:bg-[color:var(--bg-muted)]"
                        disabled={doc.isUploading}
                      >
                        {doc.isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[color:var(--slate)]" />
                        ) : (
                          <X className="h-4 w-4 text-[color:var(--slate)]" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Manual Option */}
        <div className="border-t border-[color:var(--border-muted)] pt-6">
          <p className="text-center text-sm text-[color:var(--muted-ink)]">
            Prefer to type everything yourself?{" "}
            <button
              onClick={handleManualIntake}
              className="font-medium text-[color:var(--brand)] underline hover:no-underline"
            >
              Complete intake online instead
            </button>
          </p>
        </div>

        {/* Submit Button */}
        <Button
          size="lg"
          className="w-full"
          disabled={isSubmitting || !selectedDate || !selectedTime || !phoneNumber || documents.length === 0}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scheduling...
            </>
          ) : (
            "Schedule My Call"
          )}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif text-2xl text-[color:var(--brand)]">
              <Check className="h-6 w-6 text-green-600" />
              You're all set!
            </DialogTitle>
            <DialogDescription className="text-base text-[color:var(--muted-ink)]">
              We'll call you on {selectedDate && formatDate(selectedDate)} at {selectedTime}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[color:var(--brand)]">What happens next:</p>
              <ol className="space-y-2 text-sm text-[color:var(--muted-ink)]">
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[color:var(--bg-muted)] text-xs font-bold text-[color:var(--brand)]">
                    1
                  </span>
                  <span>Our team will call you at your scheduled time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[color:var(--bg-muted)] text-xs font-bold text-[color:var(--brand)]">
                    2
                  </span>
                  <span>We'll walk through your estate details (20-30 min)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[color:var(--bg-muted)] text-xs font-bold text-[color:var(--brand)]">
                    3
                  </span>
                  <span>We'll prepare your probate documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[color:var(--bg-muted)] text-xs font-bold text-[color:var(--brand)]">
                    4
                  </span>
                  <span>You'll receive them within 5-7 business days</span>
                </li>
              </ol>
            </div>
            <div className="rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-3 text-center text-sm text-[color:var(--muted-ink)]">
              Questions? Email us at{" "}
              <a
                href="mailto:support@probatedesk.ca"
                className="font-medium text-[color:var(--brand)]"
              >
                support@probatedesk.ca
              </a>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => router.push("/portal")} className="w-full">
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
