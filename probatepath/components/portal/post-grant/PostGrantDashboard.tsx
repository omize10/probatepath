"use client";

import { useState, useCallback } from "react";
import { PortalShell } from "@/components/portal/PortalShell";

type Asset = {
  id: string;
  name: string;
  category: string;
  institution: string | null;
  accountNumber: string | null;
  estimatedValue: string | null;
  actualValue: string | null;
  status: string;
  contactedAt: string | null;
  documentsSentAt: string | null;
  fundsReceivedAt: string | null;
  notes: string | null;
};

type Debt = {
  id: string;
  creditor: string;
  category: string | null;
  amount: string | null;
  verifiedAmount: string | null;
  status: string;
  verifiedAt: string | null;
  paidAt: string | null;
  notes: string | null;
};

type DistributionRecord = {
  id: string;
  beneficiaryId: string | null;
  beneficiaryName: string;
  sharePercent: string | null;
  shareAmount: string | null;
  paidAt: string | null;
  method: string | null;
  notes: string | null;
};

type Release = {
  id: string;
  beneficiaryId: string | null;
  beneficiaryName: string;
  sentAt: string | null;
  signedAt: string | null;
  fileUrl: string | null;
  notes: string | null;
};

type Beneficiary = {
  id: string;
  fullName: string;
  relationship: string;
  shareDescription: string | null;
};

type PostGrantData = {
  matterId: string;
  beneficiaries: Beneficiary[];
  assets: Asset[];
  debts: Debt[];
  distributions: DistributionRecord[];
  releases: Release[];
};

type Tab = "assets" | "debts" | "distributions" | "releases" | "closeout";

const TABS: { id: Tab; label: string }[] = [
  { id: "assets", label: "Assets" },
  { id: "debts", label: "Debts" },
  { id: "distributions", label: "Distribution" },
  { id: "releases", label: "Releases" },
  { id: "closeout", label: "Closeout" },
];

const ASSET_STATUS_LABELS: Record<string, string> = {
  identified: "Identified",
  contacted: "Contacted",
  documents_sent: "Docs sent",
  funds_received: "Received",
  closed: "Closed",
};

const DEBT_STATUS_LABELS: Record<string, string> = {
  identified: "Identified",
  verified: "Verified",
  paid: "Paid",
  disputed: "Disputed",
};

const ASSET_CATEGORIES = ["Bank account", "Investment", "Real property", "Vehicle", "Insurance", "Pension", "Personal property", "Other"];
const DEBT_CATEGORIES = ["Credit card", "Mortgage", "Loan", "Utility", "Tax", "Medical", "Other"];

export function PostGrantDashboard({ data }: { data: PostGrantData }) {
  const [activeTab, setActiveTab] = useState<Tab>("assets");
  const [assets, setAssets] = useState<Asset[]>(data.assets);
  const [debts, setDebts] = useState<Debt[]>(data.debts);
  const [distributions, setDistributions] = useState<DistributionRecord[]>(data.distributions);
  const [releases, setReleases] = useState<Release[]>(data.releases);

  const apiCall = useCallback(async (entity: string, action: string, id?: string, entityData?: Record<string, unknown>) => {
    const res = await fetch(`/api/matters/${data.matterId}/post-grant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity, action, id, data: entityData }),
    });
    return res.json();
  }, [data.matterId]);

  // Asset totals
  const totalEstimated = assets.reduce((sum, a) => sum + (parseFloat(a.estimatedValue ?? "0") || 0), 0);
  const totalActual = assets.reduce((sum, a) => sum + (parseFloat(a.actualValue ?? "0") || 0), 0);
  const totalDebts = debts.reduce((sum, d) => sum + (parseFloat(d.verifiedAmount ?? d.amount ?? "0") || 0), 0);
  const netEstate = (totalActual || totalEstimated) - totalDebts;

  return (
    <PortalShell
      title="Post-grant estate administration"
      description="Collect assets, pay debts, and distribute the estate."
      eyebrow="After the grant"
    >
      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-4 mb-6">
        <SummaryCard label="Total assets" value={formatCurrency(totalActual || totalEstimated)} />
        <SummaryCard label="Total debts" value={formatCurrency(totalDebts)} color="red" />
        <SummaryCard label="Net estate" value={formatCurrency(netEstate)} color={netEstate >= 0 ? "green" : "red"} />
        <SummaryCard label="Distributed" value={`${distributions.filter((d) => d.paidAt).length}/${distributions.length}`} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === tab.id
                ? "border-[color:var(--brand)] text-[color:var(--brand)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "assets" && (
        <AssetsTab assets={assets} setAssets={setAssets} apiCall={apiCall} />
      )}
      {activeTab === "debts" && (
        <DebtsTab debts={debts} setDebts={setDebts} apiCall={apiCall} />
      )}
      {activeTab === "distributions" && (
        <DistributionsTab
          distributions={distributions}
          setDistributions={setDistributions}
          beneficiaries={data.beneficiaries}
          netEstate={netEstate}
          apiCall={apiCall}
        />
      )}
      {activeTab === "releases" && (
        <ReleasesTab
          releases={releases}
          setReleases={setReleases}
          beneficiaries={data.beneficiaries}
          apiCall={apiCall}
        />
      )}
      {activeTab === "closeout" && (
        <CloseoutTab assets={assets} debts={debts} distributions={distributions} releases={releases} />
      )}
    </PortalShell>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
  const textColor = color === "red" ? "text-red-700" : color === "green" ? "text-green-700" : "text-gray-900";
  return (
    <div className="rounded-xl border border-[color:var(--border-muted)] bg-white p-3 text-center">
      <p className="text-xs uppercase tracking-widest text-gray-500">{label}</p>
      <p className={`text-lg font-bold ${textColor}`}>{value}</p>
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

// ============ ASSETS TAB ============

function AssetsTab({ assets, setAssets, apiCall }: { assets: Asset[]; setAssets: (a: Asset[]) => void; apiCall: (entity: string, action: string, id?: string, data?: Record<string, unknown>) => Promise<any> }) {
  const [showForm, setShowForm] = useState(false);

  const addAsset = async (formData: Record<string, string>) => {
    const result = await apiCall("asset", "create", undefined, formData);
    if (result.asset) {
      setAssets([...assets, result.asset]);
      setShowForm(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const now = new Date().toISOString();
    const extra: Record<string, unknown> = { status };
    if (status === "contacted") extra.contactedAt = now;
    if (status === "documents_sent") extra.documentsSentAt = now;
    if (status === "funds_received") extra.fundsReceivedAt = now;
    const result = await apiCall("asset", "update", id, extra);
    if (result.asset) {
      setAssets(assets.map((a) => (a.id === id ? result.asset : a)));
    }
  };

  const deleteAsset = async (id: string) => {
    await apiCall("asset", "delete", id);
    setAssets(assets.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-3">
      {assets.map((asset) => (
        <div key={asset.id} className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{asset.name}</p>
              <p className="text-xs text-gray-500">{asset.category}{asset.institution ? ` - ${asset.institution}` : ""}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700">
                {asset.actualValue ? formatCurrency(parseFloat(asset.actualValue)) : asset.estimatedValue ? `~${formatCurrency(parseFloat(asset.estimatedValue))}` : "—"}
              </span>
              <select
                value={asset.status}
                onChange={(e) => updateStatus(asset.id, e.target.value)}
                className="rounded border border-gray-200 px-2 py-1 text-xs"
              >
                {Object.entries(ASSET_STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <button onClick={() => deleteAsset(asset.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
          </div>
        </div>
      ))}

      {showForm ? (
        <AddAssetForm onSubmit={addAsset} onCancel={() => setShowForm(false)} />
      ) : (
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-4 py-2 text-xs font-medium text-gray-600 hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] transition">
          + Add asset
        </button>
      )}
    </div>
  );
}

function AddAssetForm({ onSubmit, onCancel }: { onSubmit: (data: Record<string, string>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ name: "", category: ASSET_CATEGORIES[0], institution: "", estimatedValue: "" });
  return (
    <div className="rounded-xl border border-[color:var(--brand)]/20 bg-blue-50/30 p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input placeholder="Asset name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm" />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm">
          {ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="Institution (optional)" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm" />
        <input placeholder="Estimated value" type="number" value={form.estimatedValue} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm" />
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSubmit(form)} disabled={!form.name} className="rounded-full bg-[color:var(--brand)] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Add</button>
        <button onClick={onCancel} className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600">Cancel</button>
      </div>
    </div>
  );
}

// ============ DEBTS TAB ============

function DebtsTab({ debts, setDebts, apiCall }: { debts: Debt[]; setDebts: (d: Debt[]) => void; apiCall: (entity: string, action: string, id?: string, data?: Record<string, unknown>) => Promise<any> }) {
  const [showForm, setShowForm] = useState(false);

  const addDebt = async (formData: Record<string, string>) => {
    const result = await apiCall("debt", "create", undefined, formData);
    if (result.debt) {
      setDebts([...debts, result.debt]);
      setShowForm(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const now = new Date().toISOString();
    const extra: Record<string, unknown> = { status };
    if (status === "verified") extra.verifiedAt = now;
    if (status === "paid") extra.paidAt = now;
    const result = await apiCall("debt", "update", id, extra);
    if (result.debt) {
      setDebts(debts.map((d) => (d.id === id ? result.debt : d)));
    }
  };

  const deleteDebt = async (id: string) => {
    await apiCall("debt", "delete", id);
    setDebts(debts.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-3">
      {debts.map((debt) => (
        <div key={debt.id} className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{debt.creditor}</p>
              <p className="text-xs text-gray-500">{debt.category ?? "Debt"}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-red-700">
                {debt.verifiedAmount ? formatCurrency(parseFloat(debt.verifiedAmount)) : debt.amount ? formatCurrency(parseFloat(debt.amount)) : "—"}
              </span>
              <select
                value={debt.status}
                onChange={(e) => updateStatus(debt.id, e.target.value)}
                className="rounded border border-gray-200 px-2 py-1 text-xs"
              >
                {Object.entries(DEBT_STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <button onClick={() => deleteDebt(debt.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
          </div>
        </div>
      ))}

      {showForm ? (
        <AddDebtForm onSubmit={addDebt} onCancel={() => setShowForm(false)} />
      ) : (
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-4 py-2 text-xs font-medium text-gray-600 hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] transition">
          + Add debt
        </button>
      )}
    </div>
  );
}

function AddDebtForm({ onSubmit, onCancel }: { onSubmit: (data: Record<string, string>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ creditor: "", category: DEBT_CATEGORIES[0], amount: "" });
  return (
    <div className="rounded-xl border border-[color:var(--brand)]/20 bg-blue-50/30 p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <input placeholder="Creditor name" value={form.creditor} onChange={(e) => setForm({ ...form, creditor: e.target.value })} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm" />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm">
          {DEBT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm" />
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSubmit(form)} disabled={!form.creditor} className="rounded-full bg-[color:var(--brand)] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Add</button>
        <button onClick={onCancel} className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600">Cancel</button>
      </div>
    </div>
  );
}

// ============ DISTRIBUTIONS TAB ============

function DistributionsTab({ distributions, setDistributions, beneficiaries, netEstate, apiCall }: { distributions: DistributionRecord[]; setDistributions: (d: DistributionRecord[]) => void; beneficiaries: Beneficiary[]; netEstate: number; apiCall: (entity: string, action: string, id?: string, data?: Record<string, unknown>) => Promise<any> }) {
  const totalPercent = distributions.reduce((sum, d) => sum + (parseFloat(d.sharePercent ?? "0") || 0), 0);
  const totalDistributed = distributions.filter((d) => d.paidAt).reduce((sum, d) => sum + (parseFloat(d.shareAmount ?? "0") || 0), 0);

  const initializeDistributions = async () => {
    const existing = new Set(distributions.map((d) => d.beneficiaryId));
    const newDists: DistributionRecord[] = [...distributions];
    for (const b of beneficiaries) {
      if (!existing.has(b.id)) {
        const result = await apiCall("distribution", "create", undefined, {
          beneficiaryId: b.id,
          beneficiaryName: b.fullName,
          sharePercent: b.shareDescription ? parseSharePercent(b.shareDescription) : null,
        });
        if (result.distribution) {
          newDists.push(result.distribution);
        }
      }
    }
    setDistributions(newDists);
  };

  const calculateShares = () => {
    setDistributions(distributions.map((d) => {
      const pct = parseFloat(d.sharePercent ?? "0") || 0;
      const amount = pct > 0 ? Math.round((pct / 100) * netEstate * 100) / 100 : 0;
      return { ...d, shareAmount: amount.toString() };
    }));
  };

  const markPaid = async (id: string) => {
    const result = await apiCall("distribution", "update", id, { paidAt: new Date().toISOString() });
    if (result.distribution) {
      setDistributions(distributions.map((d) => (d.id === id ? result.distribution : d)));
    }
  };

  return (
    <div className="space-y-4">
      {/* Calculator */}
      <div className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Distribution calculator</p>
            <p className="text-xs text-gray-500">Net estate: {formatCurrency(netEstate)} | Allocated: {totalPercent.toFixed(1)}% | Paid: {formatCurrency(totalDistributed)}</p>
          </div>
          <div className="flex gap-2">
            {distributions.length === 0 && beneficiaries.length > 0 && (
              <button onClick={initializeDistributions} className="rounded-full bg-[color:var(--brand)] px-3 py-1 text-xs font-semibold text-white">
                Add beneficiaries
              </button>
            )}
            {distributions.length > 0 && (
              <button onClick={calculateShares} className="rounded-full border border-[color:var(--brand)] px-3 py-1 text-xs font-semibold text-[color:var(--brand)]">
                Calculate amounts
              </button>
            )}
          </div>
        </div>
        {totalPercent > 100 && (
          <p className="text-xs text-red-600 mb-2">Total percentage exceeds 100%. Please adjust shares.</p>
        )}
      </div>

      {/* Distribution rows */}
      {distributions.map((dist) => (
        <div key={dist.id} className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{dist.beneficiaryName}</p>
              <p className="text-xs text-gray-500">
                {dist.sharePercent ? `${dist.sharePercent}%` : "No share set"}
                {dist.shareAmount ? ` = ${formatCurrency(parseFloat(dist.shareAmount))}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {dist.paidAt ? (
                <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Paid</span>
              ) : (
                <button onClick={() => markPaid(dist.id)} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:border-green-500 hover:text-green-700">
                  Mark paid
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function parseSharePercent(desc: string): string | null {
  const match = desc.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? match[1] : null;
}

// ============ RELEASES TAB ============

function ReleasesTab({ releases, setReleases, beneficiaries, apiCall }: { releases: Release[]; setReleases: (r: Release[]) => void; beneficiaries: Beneficiary[]; apiCall: (entity: string, action: string, id?: string, data?: Record<string, unknown>) => Promise<any> }) {
  const initializeReleases = async () => {
    const existing = new Set(releases.map((r) => r.beneficiaryId));
    const newReleases: Release[] = [...releases];
    for (const b of beneficiaries) {
      if (!existing.has(b.id)) {
        const result = await apiCall("release", "create", undefined, {
          beneficiaryId: b.id,
          beneficiaryName: b.fullName,
        });
        if (result.release) {
          newReleases.push(result.release);
        }
      }
    }
    setReleases(newReleases);
  };

  const updateRelease = async (id: string, updates: Record<string, unknown>) => {
    const result = await apiCall("release", "update", id, updates);
    if (result.release) {
      setReleases(releases.map((r) => (r.id === id ? result.release : r)));
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4">
        <p className="text-sm text-gray-700 mb-3">
          Once distributions are made, get a signed release from each beneficiary confirming they received their share.
        </p>
        {releases.length === 0 && beneficiaries.length > 0 && (
          <button onClick={initializeReleases} className="rounded-full bg-[color:var(--brand)] px-4 py-1.5 text-xs font-semibold text-white">
            Add all beneficiaries
          </button>
        )}
      </div>

      {releases.map((release) => (
        <div key={release.id} className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{release.beneficiaryName}</p>
              <p className="text-xs text-gray-500">
                {release.signedAt ? "Signed" : release.sentAt ? "Sent, awaiting signature" : "Not sent"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!release.sentAt && (
                <button
                  onClick={() => updateRelease(release.id, { sentAt: new Date().toISOString() })}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:border-[color:var(--brand)]"
                >
                  Mark sent
                </button>
              )}
              {release.sentAt && !release.signedAt && (
                <button
                  onClick={() => updateRelease(release.id, { signedAt: new Date().toISOString() })}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:border-green-500 hover:text-green-700"
                >
                  Mark signed
                </button>
              )}
              {release.signedAt && (
                <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Complete</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============ CLOSEOUT TAB ============

function CloseoutTab({ assets, debts, distributions, releases }: { assets: Asset[]; debts: Debt[]; distributions: DistributionRecord[]; releases: Release[] }) {
  const allAssetsCollected = assets.length > 0 && assets.every((a) => a.status === "funds_received" || a.status === "closed");
  const allDebtsPaid = debts.length === 0 || debts.every((d) => d.status === "paid");
  const allDistributed = distributions.length > 0 && distributions.every((d) => d.paidAt);
  const allReleasesSigned = releases.length > 0 && releases.every((r) => r.signedAt);

  const steps = [
    { label: "All assets collected or transferred", done: allAssetsCollected },
    { label: "All debts and liabilities paid", done: allDebtsPaid },
    { label: "All distributions made to beneficiaries", done: allDistributed },
    { label: "All beneficiary releases signed", done: allReleasesSigned },
    { label: "Final tax return filed", done: false },
    { label: "Estate bank account closed", done: false },
    { label: "Court notified of estate closure (if required)", done: false },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[color:var(--border-muted)] bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Estate closeout checklist</h3>
          <span className="text-xs text-gray-500">{completedCount}/{steps.length} complete</span>
        </div>
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.label} className="flex items-center gap-3">
              {step.done ? (
                <svg className="h-5 w-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300 shrink-0" />
              )}
              <span className={`text-sm ${step.done ? "text-gray-500 line-through" : "text-gray-900"}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {allDone && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-5 text-center">
          <p className="text-sm font-semibold text-green-800">The estate is fully administered.</p>
          <p className="text-xs text-green-700 mt-1">All assets collected, debts paid, distributions made, and releases signed.</p>
        </div>
      )}

      <div className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4 text-xs text-gray-600 space-y-2">
        <p className="font-medium text-gray-900">Final steps (manual)</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>File a final T1 tax return for the deceased for the year of death.</li>
          <li>File a T3 Trust Return if the estate earned income during administration.</li>
          <li>Get a tax clearance certificate from CRA before final distribution.</li>
          <li>Close the estate bank account after all transactions clear.</li>
          <li>Keep records for 7 years after the estate is closed.</li>
        </ul>
      </div>
    </div>
  );
}
