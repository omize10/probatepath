"use client";

import { useState, useMemo } from "react";

function calculateProbateFees(estateValue: number) {
  if (estateValue <= 0) return { filingFee: 0, probateFee: 0, total: 0, breakdown: [] };

  const filingFee = 200;
  let probateFee = 0;
  const breakdown: { label: string; amount: number; detail: string }[] = [];

  // First $25,000: No fee
  const firstBracket = Math.min(estateValue, 25000);
  breakdown.push({ label: "First $25,000", amount: 0, detail: "No fee" });

  // $25,001 - $50,000: $6 per $1,000 (0.6%)
  if (estateValue > 25000) {
    const secondBracket = Math.min(estateValue - 25000, 25000);
    const secondFee = Math.ceil(secondBracket / 1000) * 6;
    probateFee += secondFee;
    breakdown.push({
      label: `$25,001 to $${Math.min(estateValue, 50000).toLocaleString()}`,
      amount: secondFee,
      detail: `$6 per $1,000 on $${secondBracket.toLocaleString()}`,
    });
  }

  // Over $50,000: $14 per $1,000 (1.4%)
  if (estateValue > 50000) {
    const thirdBracket = estateValue - 50000;
    const thirdFee = Math.ceil(thirdBracket / 1000) * 14;
    probateFee += thirdFee;
    breakdown.push({
      label: `Over $50,000`,
      amount: thirdFee,
      detail: `$14 per $1,000 on $${thirdBracket.toLocaleString()}`,
    });
  }

  return { filingFee, probateFee, total: filingFee + probateFee, breakdown };
}

const PRESET_VALUES = [100000, 250000, 500000, 750000, 1000000, 2000000];

export function ProbateFeeCalculator() {
  const [inputValue, setInputValue] = useState("");
  const [estateValue, setEstateValue] = useState(0);

  const result = useMemo(() => calculateProbateFees(estateValue), [estateValue]);

  const handleInputChange = (value: string) => {
    // Strip non-numeric characters except for the input
    const numeric = value.replace(/[^0-9]/g, "");
    setInputValue(numeric ? parseInt(numeric, 10).toLocaleString() : "");
    setEstateValue(numeric ? parseInt(numeric, 10) : 0);
  };

  const handlePreset = (value: number) => {
    setInputValue(value.toLocaleString());
    setEstateValue(value);
  };

  const effectiveRate = estateValue > 0 ? ((result.total / estateValue) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-6 shadow-sm">
        <label className="block text-sm font-semibold text-[color:var(--ink)] mb-2">
          Gross estate value (assets that pass through probate)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-slate-600">$</span>
          <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Enter estate value"
            className="w-full rounded-xl border border-gray-200 py-4 pl-10 pr-4 text-2xl font-semibold text-[color:var(--ink)] focus:border-[color:var(--brand)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/20 transition"
            aria-label="Estate value in Canadian dollars"
          />
        </div>

        {/* Quick presets */}
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESET_VALUES.map((val) => (
            <button
              key={val}
              onClick={() => handlePreset(val)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                estateValue === val
                  ? "border-[color:var(--brand)] bg-blue-100 text-[color:var(--brand)]"
                  : "border-gray-200 text-slate-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              ${(val / 1000000 >= 1) ? `${val / 1000000}M` : `${val / 1000}K`}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {estateValue > 0 && (
        <div className="rounded-2xl border border-[color:var(--brand)]/20 bg-gradient-to-b from-blue-50/50 to-white p-6 shadow-sm">
          {/* Total */}
          <div className="text-center mb-6">
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Probate Court Costs</p>
            <p className="text-4xl font-bold text-[color:var(--brand)] mt-1">
              ${result.total.toLocaleString()}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Effective rate: {effectiveRate}% of estate value
            </p>
          </div>

          {/* Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[color:var(--ink)] border-b border-gray-100 pb-2">Fee Breakdown</h3>

            {/* Probate fee brackets */}
            {result.breakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-700">{item.detail}</p>
                </div>
                <p className={`text-sm font-semibold ${item.amount === 0 ? "text-green-600" : "text-[color:var(--ink)]"}`}>
                  {item.amount === 0 ? "Free" : `$${item.amount.toLocaleString()}`}
                </p>
              </div>
            ))}

            {/* Subtotals */}
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between">
                <p className="text-sm text-slate-700">Probate fees subtotal</p>
                <p className="text-sm font-semibold text-[color:var(--ink)]">${result.probateFee.toLocaleString()}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-slate-700">Court filing fee</p>
                <p className="text-sm font-semibold text-[color:var(--ink)]">${result.filingFee.toLocaleString()}</p>
              </div>
            </div>

            {/* Grand total */}
            <div className="border-t-2 border-[color:var(--brand)]/20 pt-3">
              <div className="flex justify-between items-center">
                <p className="text-base font-bold text-[color:var(--ink)]">Total court costs</p>
                <p className="text-xl font-bold text-[color:var(--brand)]">${result.total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Comparison callout */}
          <div className="mt-6 rounded-xl bg-[color:var(--bg-muted)] p-4">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">With ProbateDesk</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-[color:var(--brand)]">
                ${(result.total + 799).toLocaleString()} - ${(result.total + 2499).toLocaleString()}
              </span>
              <span className="text-xs text-slate-600">total (court fees + our service)</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              vs. ${ (result.total + 3000).toLocaleString()} - ${(result.total + 15000).toLocaleString()} with a lawyer
            </p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>Note:</strong> This calculator provides estimates based on the BC Supreme Court Civil Rules
          probate fee schedule. Actual fees may vary. Estate value should reflect only assets that pass through
          probate (not joint assets, beneficiary-designated accounts, or life insurance). This is for
          informational purposes only and does not constitute legal or financial advice. Fees are subject to
          change by the BC government.
        </p>
      </div>
    </div>
  );
}
