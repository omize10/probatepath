"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
  X,
  Loader2,
  Clock,
  MapPin,
} from "lucide-react";
import { TIME_SLOTS } from "@/types/pricing";

interface AvailabilitySlot {
  id: string;
  date: string;
  time: string;
}

interface BookedCallback {
  date: string;
  time: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Get current Pacific Time
function getPacificTime(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Vancouver" })
  );
}

// Format time in Pacific timezone
function formatPacificTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    timeZone: "America/Vancouver",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const days: (Date | null)[] = [];

  // Add empty slots for days before the first day
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // Add all days in the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  return days;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function OpsCalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [bookedCallbacks, setBookedCallbacks] = useState<BookedCallback[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthDays(year, month);

  // Fetch availability data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Get start and end of current month view (with buffer)
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 2, 0);

      const [slotsRes, callbacksRes] = await Promise.all([
        fetch(
          `/api/ops/availability?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
        ),
        fetch(`/api/ops/callbacks?includeCompleted=false`),
      ]);

      if (slotsRes.ok) {
        const data = await slotsRes.json();
        setSlots(data.slots || []);
      }

      if (callbacksRes.ok) {
        const data = await callbacksRes.json();
        const callbacks = (data.callbacks || []).map(
          (cb: { scheduledDate: string; scheduledTime: string }) => ({
            date: new Date(cb.scheduledDate).toISOString().split("T")[0],
            time: cb.scheduledTime,
          })
        );
        setBookedCallbacks(callbacks);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get available slots for a specific date
  const getAvailableSlotsForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return slots.filter((s) => s.date.split("T")[0] === dateKey);
  };

  // Get booked callbacks for a specific date
  const getBookedForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return bookedCallbacks.filter((cb) => cb.date === dateKey);
  };

  // Check if a specific time slot is available for the selected date
  const isTimeAvailable = (time: string) => {
    if (!selectedDate) return false;
    const dateKey = formatDateKey(selectedDate);
    return slots.some(
      (s) => s.date.split("T")[0] === dateKey && s.time === time
    );
  };

  // Check if a specific time slot is booked
  const isTimeBooked = (time: string) => {
    if (!selectedDate) return false;
    const dateKey = formatDateKey(selectedDate);
    return bookedCallbacks.some(
      (cb) => cb.date === dateKey && cb.time === time
    );
  };

  // Toggle a single time slot
  const toggleTimeSlot = async (time: string) => {
    if (!selectedDate || saving) return;

    const dateKey = formatDateKey(selectedDate);
    const isCurrentlyAvailable = isTimeAvailable(time);

    setSaving(true);
    try {
      if (isCurrentlyAvailable) {
        // Remove availability
        const response = await fetch("/api/ops/availability", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateKey, times: [time] }),
        });

        if (response.ok) {
          setSlots((prev) =>
            prev.filter(
              (s) => !(s.date.split("T")[0] === dateKey && s.time === time)
            )
          );
        } else {
          const data = await response.json();
          alert(data.error || "Failed to remove slot");
        }
      } else {
        // Add availability
        const response = await fetch("/api/ops/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateKey, times: [time] }),
        });

        if (response.ok) {
          setSlots((prev) => [
            ...prev,
            { id: `temp-${Date.now()}`, date: dateKey, time },
          ]);
        }
      }
    } catch (error) {
      console.error("Failed to toggle slot:", error);
    } finally {
      setSaving(false);
    }
  };

  // Set all slots for selected date
  const setAllSlots = async (available: boolean) => {
    if (!selectedDate || saving) return;

    const dateKey = formatDateKey(selectedDate);
    const booked = getBookedForDate(selectedDate);
    const bookedTimes = new Set(booked.map((b) => b.time));

    // Filter out booked times
    const timesToSet = TIME_SLOTS.filter((t) => !bookedTimes.has(t));

    if (timesToSet.length === 0) return;

    setSaving(true);
    try {
      if (available) {
        const response = await fetch("/api/ops/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateKey, times: timesToSet }),
        });

        if (response.ok) {
          const newSlots = timesToSet.map((time) => ({
            id: `temp-${Date.now()}-${time}`,
            date: dateKey,
            time,
          }));
          setSlots((prev) => {
            const existing = prev.filter(
              (s) => s.date.split("T")[0] !== dateKey
            );
            return [...existing, ...newSlots];
          });
        }
      } else {
        const response = await fetch("/api/ops/availability", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateKey, times: timesToSet }),
        });

        if (response.ok) {
          setSlots((prev) =>
            prev.filter((s) => s.date.split("T")[0] !== dateKey)
          );
        }
      }
    } catch (error) {
      console.error("Failed to set all slots:", error);
    } finally {
      setSaving(false);
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Current Pacific Time for display
  const [currentPacificTime, setCurrentPacificTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = getPacificTime();
      setCurrentPacificTime(formatPacificTime(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">
            Operations
          </p>
          <h1 className="font-serif text-4xl text-[color:var(--ink)]">
            Availability Calendar
          </h1>
          <p className="text-sm text-[color:var(--ink-muted)]">
            Set your available time slots for callback scheduling. Clients can
            only book times you mark as available.
          </p>
        </div>

        {/* Pacific Time Clock */}
        <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--border-muted)] bg-gradient-to-br from-white to-[color:var(--bg-muted)] px-4 py-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand)]/10">
            <Clock className="h-5 w-5 text-[color:var(--brand)]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[color:var(--ink)]">
              {currentPacificTime || "—"}
            </p>
            <div className="flex items-center gap-1 text-xs text-[color:var(--ink-muted)]">
              <MapPin className="h-3 w-3" />
              <span>Pacific Time (Vancouver)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Calendar Grid */}
        <div className="overflow-hidden rounded-3xl border border-[color:var(--border-muted)] bg-white shadow-[0_25px_80px_-60px_rgba(15,23,42,0.22)]">
          {/* Month Navigation */}
          <div className="flex items-center justify-between border-b border-[color:var(--border-muted)] px-6 py-4">
            <button
              onClick={prevMonth}
              className="rounded-full p-2 hover:bg-[color:var(--bg-muted)] transition"
            >
              <ChevronLeft className="h-5 w-5 text-[color:var(--ink)]" />
            </button>
            <h2 className="font-serif text-xl text-[color:var(--ink)]">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="rounded-full p-2 hover:bg-[color:var(--bg-muted)] transition"
            >
              <ChevronRight className="h-5 w-5 text-[color:var(--ink)]" />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-[color:var(--border-muted)]">
            {DAYS.map((day) => (
              <div
                key={day}
                className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[color:var(--ink-muted)]"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[color:var(--brand)]" />
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {days.map((date, i) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${i}`}
                      className="min-h-[100px] border-b border-r border-[color:var(--border-muted)] bg-[color:var(--bg-muted)]/30"
                    />
                  );
                }

                const availableCount = getAvailableSlotsForDate(date).length;
                const bookedCount = getBookedForDate(date).length;
                const isSelected =
                  selectedDate && formatDateKey(date) === formatDateKey(selectedDate);
                const past = isPast(date);

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => !past && setSelectedDate(date)}
                    disabled={past}
                    className={`min-h-[100px] border-b border-r border-[color:var(--border-muted)] p-2 text-left transition ${
                      past
                        ? "cursor-not-allowed bg-[color:var(--bg-muted)]/50 opacity-50"
                        : isSelected
                        ? "bg-[color:var(--brand)]/10 ring-2 ring-inset ring-[color:var(--brand)]"
                        : "hover:bg-[color:var(--bg-muted)]"
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold ${
                        isToday(date)
                          ? "flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--brand)] text-white"
                          : "text-[color:var(--ink)]"
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    {!past && (
                      <div className="mt-1 space-y-1">
                        {availableCount > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-xs text-green-700">
                              {availableCount} available
                            </span>
                          </div>
                        )}
                        {bookedCount > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            <span className="text-xs text-blue-700">
                              {bookedCount} booked
                            </span>
                          </div>
                        )}
                        {availableCount === 0 && bookedCount === 0 && (
                          <span className="text-xs text-[color:var(--ink-muted)]">
                            No slots
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Time Slots Panel */}
        <div className="overflow-hidden rounded-3xl border border-[color:var(--border-muted)] bg-white shadow-[0_25px_80px_-60px_rgba(15,23,42,0.22)]">
          {selectedDate ? (
            <>
              <div className="border-b border-[color:var(--border-muted)] bg-gradient-to-br from-white to-[color:var(--bg-muted)]/50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-[color:var(--brand)]" />
                  <h3 className="font-serif text-lg text-[color:var(--ink)]">
                    {selectedDate.toLocaleDateString("en-CA", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-[color:var(--ink-muted)]">
                  <Clock className="h-3 w-3" />
                  All times in Pacific Time (PT) · Click to toggle
                </p>
              </div>

              {/* Bulk Actions */}
              <div className="flex gap-2 border-b border-[color:var(--border-muted)] px-6 py-3">
                <button
                  onClick={() => setAllSlots(true)}
                  disabled={saving}
                  className="flex-1 rounded-full bg-green-100 px-3 py-2 text-xs font-semibold text-green-800 transition hover:bg-green-200 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    "Set All Available"
                  )}
                </button>
                <button
                  onClick={() => setAllSlots(false)}
                  disabled={saving}
                  className="flex-1 rounded-full bg-red-100 px-3 py-2 text-xs font-semibold text-red-800 transition hover:bg-red-200 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    "Clear All"
                  )}
                </button>
              </div>

              {/* Time Slots List */}
              <div className="max-h-[500px] overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((time) => {
                    const available = isTimeAvailable(time);
                    const booked = isTimeBooked(time);

                    return (
                      <button
                        key={time}
                        onClick={() => !booked && toggleTimeSlot(time)}
                        disabled={booked || saving}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                          booked
                            ? "cursor-not-allowed border-blue-200 bg-blue-50 text-blue-800"
                            : available
                            ? "border-green-300 bg-green-50 text-green-800 hover:bg-green-100"
                            : "border-[color:var(--border-muted)] text-[color:var(--ink-muted)] hover:border-[color:var(--brand)] hover:bg-[color:var(--bg-muted)]"
                        }`}
                      >
                        <span>{time}</span>
                        {booked ? (
                          <span className="text-xs">Booked</span>
                        ) : available ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4 opacity-30" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-[400px] items-center justify-center p-6 text-center">
              <div className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--bg-muted)]">
                  <CalendarIcon className="h-8 w-8 text-[color:var(--ink-muted)]" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-[color:var(--ink)]">
                    Select a Date
                  </p>
                  <p className="text-sm text-[color:var(--ink-muted)]">
                    Click on a date in the calendar to manage<br />
                    available time slots for client bookings
                  </p>
                </div>
                <div className="mx-auto flex items-center gap-1 rounded-full bg-[color:var(--bg-muted)] px-3 py-1.5 text-xs text-[color:var(--ink-muted)]">
                  <Clock className="h-3 w-3" />
                  <span>All times in Pacific Time</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend & Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[color:var(--border-muted)] bg-white px-6 py-4">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-[color:var(--ink-muted)]">Available for booking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-[color:var(--ink-muted)]">Booked by client</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-300" />
            <span className="text-[color:var(--ink-muted)]">Not available</span>
          </div>
        </div>
        <p className="text-xs text-[color:var(--ink-muted)]">
          Slots from 9:00 AM – 9:00 PM PT · 30-minute intervals
        </p>
      </div>
    </div>
  );
}
