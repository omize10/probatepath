'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Phone,
  Check,
  Loader2,
  MapPin,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getOnboardState } from "@/lib/onboard/state";

// Get current Pacific Time for display
function getPacificTimeString(): string {
  return new Date().toLocaleTimeString("en-US", {
    timeZone: "America/Vancouver",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface AvailableSlot {
  date: string;
  times: string[];
}

export default function PortalSchedulePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBooked, setIsBooked] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  // Availability state
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  // Load phone from onboard state
  useEffect(() => {
    const state = getOnboardState();
    if (state.phone) {
      setPhoneNumber(state.phone);
    }
  }, []);

  // Fetch available slots on mount
  useEffect(() => {
    async function fetchAvailability() {
      try {
        const response = await fetch("/api/availability");
        if (response.ok) {
          const data = await response.json();
          setAvailableSlots(data.available || []);
        } else {
          // If no availability API, generate mock slots for next 7 days
          const mockSlots: AvailableSlot[] = [];
          const today = new Date();
          for (let i = 1; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;
            mockSlots.push({
              date: date.toISOString().split("T")[0],
              times: [
                "9:00 AM", "10:00 AM", "11:00 AM",
                "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
              ],
            });
          }
          setAvailableSlots(mockSlots);
        }
      } catch (err) {
        console.error("Failed to fetch availability:", err);
        // Generate mock slots on error
        const mockSlots: AvailableSlot[] = [];
        const today = new Date();
        for (let i = 1; i <= 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          if (date.getDay() === 0 || date.getDay() === 6) continue;
          mockSlots.push({
            date: date.toISOString().split("T")[0],
            times: [
              "9:00 AM", "10:00 AM", "11:00 AM",
              "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
            ],
          });
        }
        setAvailableSlots(mockSlots);
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

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-CA", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !phoneNumber) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create the callback schedule
      const response = await fetch("/api/callback/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          phoneNumber,
          tier: "guided",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to schedule callback");
      }

      // Show confirmation
      setIsBooked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Track current Pacific time for display
  const [currentPT, setCurrentPT] = useState<string>("");

  useEffect(() => {
    const updateTime = () => setCurrentPT(getPacificTimeString());
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Confirmation view
  if (isBooked) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">
            You're All Set!
          </h1>
          <p className="mt-4 text-lg text-[color:var(--muted-ink)]">
            See you on <span className="font-semibold text-[color:var(--brand)]">{formatShortDate(selectedDate)}</span> at{" "}
            <span className="font-semibold text-[color:var(--brand)]">{selectedTime}</span>
          </p>
          <p className="mt-2 text-[color:var(--muted-ink)]">
            We'll call you at {phoneNumber}
          </p>
        </div>

        <Card className="border-[color:var(--border-muted)]">
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold text-[color:var(--brand)]">What happens next:</h3>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[color:var(--brand)] text-sm font-bold text-white">
                  1
                </span>
                <div>
                  <p className="font-medium text-[color:var(--brand)]">We call you at your scheduled time</p>
                  <p className="text-sm text-[color:var(--muted-ink)]">The call takes about 20-30 minutes</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[color:var(--brand)] text-sm font-bold text-white">
                  2
                </span>
                <div>
                  <p className="font-medium text-[color:var(--brand)]">We collect your estate details</p>
                  <p className="text-sm text-[color:var(--muted-ink)]">Have the will and key documents handy if possible</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[color:var(--brand)] text-sm font-bold text-white">
                  3
                </span>
                <div>
                  <p className="font-medium text-[color:var(--brand)]">We review and prepare your documents</p>
                  <p className="text-sm text-[color:var(--muted-ink)]">Our team checks everything before you file</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[color:var(--brand)] text-sm font-bold text-white">
                  4
                </span>
                <div>
                  <p className="font-medium text-[color:var(--brand)]">You receive your probate package</p>
                  <p className="text-sm text-[color:var(--muted-ink)]">Complete with step-by-step filing instructions</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Link href="/portal">
            <Button size="lg" className="w-full">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="text-center text-sm text-[color:var(--muted-ink)]">
            Need to reschedule?{" "}
            <a
              href="mailto:support@probatedesk.ca"
              className="font-medium text-[color:var(--brand)] underline hover:no-underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">
          Payment Received!
        </h1>
        <p className="mx-auto max-w-xl text-base text-[color:var(--muted-ink)]">
          Now let's schedule your intake call. Our team will walk you through everything
          and collect the details we need to prepare your probate documents.
        </p>
        {/* Pacific Time indicator */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--bg-muted)] px-4 py-2 text-sm text-[color:var(--muted-ink)]">
          <MapPin className="h-4 w-4" />
          <span>All times in Pacific Time (Vancouver)</span>
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

      <Card className="border-[color:var(--border-muted)] shadow-[0_30px_80px_-70px_rgba(15,23,42,0.25)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-[color:var(--brand)]">
            <Calendar className="h-6 w-6" />
            Schedule Your Intake Call
          </CardTitle>
          <CardDescription className="text-sm text-[color:var(--muted-ink)]">
            The call takes about 20-30 minutes
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
                    Select Time
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
                  className="h-12 rounded-2xl"
                />
                <p className="text-xs text-[color:var(--muted-ink)]">
                  We'll call you at this number at your scheduled time.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* What to Have Ready */}
      <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-6">
        <h3 className="mb-3 font-semibold text-[color:var(--brand)]">Have these ready for your call:</h3>
        <ul className="space-y-2 text-sm text-[color:var(--muted-ink)]">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            The original will (if there is one)
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            Death certificate
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            List of major assets and debts
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            Names and addresses of beneficiaries
          </li>
        </ul>
      </div>

      {/* Submit Button */}
      <Button
        size="lg"
        className="w-full"
        disabled={isSubmitting || !selectedDate || !selectedTime || !phoneNumber}
        onClick={handleSubmit}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Scheduling...
          </>
        ) : (
          "Confirm Booking"
        )}
      </Button>

      {/* Alternative option */}
      <p className="text-center text-sm text-[color:var(--muted-ink)]">
        Prefer to complete intake online yourself?{" "}
        <Link
          href="/portal/intake"
          className="font-medium text-[color:var(--brand)] underline hover:no-underline"
        >
          Start online intake instead
        </Link>
      </p>
    </div>
  );
}
