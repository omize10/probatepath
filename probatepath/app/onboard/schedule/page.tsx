"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOnboardState, saveOnboardState } from "@/lib/onboard/state";

// Generate available dates (next 14 days, excluding weekends)
function getAvailableDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  let current = new Date(today);
  current.setDate(current.getDate() + 1); // Start tomorrow

  while (dates.length < 10) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// Generate time slots (9am-5pm in 30-min increments)
const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
];

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
}

function formatDateFull(date: Date): string {
  return date.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export default function OnboardSchedulePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const availableDates = getAvailableDates();

  useEffect(() => {
    const state = getOnboardState();
    if (!state.phone) {
      router.push("/onboard/phone");
      return;
    }
    if (!state.scheduledCall) {
      router.push("/onboard/call-choice");
      return;
    }
    setPhone(state.phone);
  }, [router]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);

    // Create datetime string
    const dateStr = selectedDate.toISOString().split("T")[0];
    const callDatetime = `${dateStr} ${selectedTime}`;

    saveOnboardState({ callDatetime });

    // Simulate API call to schedule
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsConfirmed(true);
    setIsSubmitting(false);
  };

  if (isConfirmed) {
    return (
      <div className="space-y-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
            Great! You&apos;re all set.
          </h1>
          <p className="text-[color:var(--muted-ink)]">
            We&apos;ll call you at{" "}
            <span className="font-medium text-[color:var(--brand)]">{phone}</span>
            {" "}on{" "}
            <span className="font-medium text-[color:var(--brand)]">
              {selectedDate && formatDateFull(selectedDate)} at {selectedTime}
            </span>.
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={() => router.push("/onboard/screening")} className="w-full h-12">
            Continue to Questionnaire
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={() => router.push("/")} className="w-full">
            I&apos;ll Wait for the Call
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
          Pick a time that works
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          Choose a convenient time for a quick 10-minute call.
        </p>
      </div>

      <div className="space-y-6">
        {/* Date Selection */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--brand)]">
            <Calendar className="w-4 h-4" />
            Select a date
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableDates.map((date, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDate(date)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all
                  ${selectedDate?.toDateString() === date.toDateString()
                    ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5 text-[color:var(--brand)]"
                    : "border-[color:var(--border-muted)] hover:border-[color:var(--brand)]/50"
                  }`}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--brand)]">
              <Clock className="w-4 h-4" />
              Select a time
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-2 rounded-lg border-2 text-xs font-medium transition-all
                    ${selectedTime === time
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5 text-[color:var(--brand)]"
                      : "border-[color:var(--border-muted)] hover:border-[color:var(--brand)]/50"
                    }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDate && selectedTime && (
          <div className="p-4 rounded-lg bg-[color:var(--brand)]/5 border border-[color:var(--brand)]/20">
            <p className="text-sm text-[color:var(--brand)]">
              <span className="font-medium">Selected:</span> {formatDateFull(selectedDate)} at {selectedTime}
            </p>
          </div>
        )}

        <Button
          onClick={handleConfirm}
          disabled={!selectedDate || !selectedTime || isSubmitting}
          className="w-full h-12"
        >
          {isSubmitting ? "Scheduling..." : "Confirm Appointment"}
        </Button>
      </div>

      <div className="text-center">
        <button
          onClick={() => {
            saveOnboardState({ scheduledCall: false });
            router.push("/onboard/screening");
          }}
          className="text-sm text-[color:var(--muted-ink)] hover:text-[color:var(--brand)] underline"
        >
          Changed your mind? Continue without a call
        </button>
      </div>

      <Button variant="ghost" onClick={() => router.push("/onboard/call-choice")} className="w-full">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
    </div>
  );
}
