import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getNextCaseCode } from "@/lib/cases";
import { randomUUID } from "crypto";

async function requireOpsAuth() {
  const cookieStore = await cookies();
  if (cookieStore.get("ops_auth")?.value !== "1") {
    redirect("/ops");
  }
}

async function createCaseAction(formData: FormData) {
  "use server";
  await requireOpsAuth();

  const exFullName = formData.get("exFullName")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim() || "";
  const exPhone = formData.get("exPhone")?.toString().trim() || null;
  const exCity = formData.get("exCity")?.toString().trim() || "";
  const exRelation = formData.get("exRelation")?.toString().trim() || "";
  const decFullName = formData.get("decFullName")?.toString().trim() || "";
  const decDateOfDeath = formData.get("decDateOfDeath")?.toString().trim() || "";
  const decCityProv = formData.get("decCityProv")?.toString().trim() || "";
  const hadWill = formData.get("hadWill")?.toString() === "yes";
  const willLocation = formData.get("willLocation")?.toString().trim() || null;
  const estateValueRange = formData.get("estateValueRange")?.toString().trim() || "<$100k";
  const anyRealProperty = formData.get("anyRealProperty")?.toString() === "yes";
  const multipleBeneficiaries = formData.get("multipleBeneficiaries")?.toString() === "yes";
  const specialCircumstances = formData.get("specialCircumstances")?.toString().trim() || null;

  if (!exFullName || !email || !decFullName || !decDateOfDeath) {
    redirect("/ops/new-case?error=missing-fields");
  }

  const clientKey = randomUUID();
  const caseCode = await getNextCaseCode();

  const parsedDate = new Date(decDateOfDeath);
  const safeDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  const matter = await prisma.$transaction(async (tx) => {
    const newMatter = await tx.matter.create({
      data: {
        clientKey,
        caseCode,
        status: "INTAKE",
        portalStatus: "intake_complete",
      },
    });

    await tx.intakeDraft.create({
      data: {
        matterId: newMatter.id,
        email,
        consent: true,
        exFullName,
        exPhone,
        exCity,
        exRelation,
        decFullName,
        decDateOfDeath: safeDate,
        decCityProv,
        hadWill,
        willLocation,
        estateValueRange,
        anyRealProperty,
        multipleBeneficiaries,
        specialCircumstances,
      },
    });

    return newMatter;
  });

  revalidatePath("/ops");
  redirect(`/ops/cases/${matter.id}`);
}

interface NewCasePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NewCasePage({ searchParams }: NewCasePageProps) {
  const params = await searchParams;
  const hasError = params.error === "missing-fields";

  const inputClass = "w-full rounded-2xl border border-[color:var(--border-muted)] bg-white px-3 py-2 text-sm";
  const labelClass = "space-y-1";
  const labelTextClass = "text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-muted)]";

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link href="/ops" className="text-xs text-[color:var(--brand)] underline-offset-4 hover:underline">
          &larr; Back to cases
        </Link>
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Operations</p>
        <h1 className="font-serif text-3xl text-[color:var(--ink)]">New case</h1>
        <p className="text-sm text-[color:var(--ink-muted)]">Manually create a new intake case.</p>
      </div>

      {hasError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          Please fill in all required fields: executor name, email, deceased name, and date of death.
        </div>
      )}

      <form action={createCaseAction} className="space-y-6">
        {/* Executor / Applicant */}
        <div className="space-y-4 rounded-3xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_25px_80px_-60px_rgba(15,23,42,0.22)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Executor / Applicant</p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>
              <span className={labelTextClass}>Full name <span className="text-red-500">*</span></span>
              <input type="text" name="exFullName" required className={inputClass} />
            </label>
            <label className={labelClass}>
              <span className={labelTextClass}>Email <span className="text-red-500">*</span></span>
              <input type="email" name="email" required className={inputClass} />
            </label>
            <label className={labelClass}>
              <span className={labelTextClass}>Phone</span>
              <input type="tel" name="exPhone" className={inputClass} />
            </label>
            <label className={labelClass}>
              <span className={labelTextClass}>City</span>
              <input type="text" name="exCity" className={inputClass} />
            </label>
            <label className={labelClass}>
              <span className={labelTextClass}>Relationship to deceased</span>
              <select name="exRelation" className={inputClass}>
                <option value="">-- Select --</option>
                <option value="spouse">Spouse / Partner</option>
                <option value="child">Child</option>
                <option value="sibling">Sibling</option>
                <option value="parent">Parent</option>
                <option value="relative">Other relative</option>
                <option value="friend">Friend</option>
                <option value="professional">Professional (lawyer, accountant)</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
        </div>

        {/* Deceased */}
        <div className="space-y-4 rounded-3xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_25px_80px_-60px_rgba(15,23,42,0.22)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Deceased</p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>
              <span className={labelTextClass}>Full name <span className="text-red-500">*</span></span>
              <input type="text" name="decFullName" required className={inputClass} />
            </label>
            <label className={labelClass}>
              <span className={labelTextClass}>Date of death <span className="text-red-500">*</span></span>
              <input type="date" name="decDateOfDeath" required className={inputClass} />
            </label>
            <label className={labelClass}>
              <span className={labelTextClass}>City / Province</span>
              <input type="text" name="decCityProv" placeholder="e.g. Vancouver, BC" className={inputClass} />
            </label>
          </div>
        </div>

        {/* Will & Estate */}
        <div className="space-y-4 rounded-3xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_25px_80px_-60px_rgba(15,23,42,0.22)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Will & Estate</p>
          <div className="grid gap-4 md:grid-cols-2">
            <fieldset className="space-y-1">
              <legend className={labelTextClass}>Had a will?</legend>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" name="hadWill" value="yes" /> Yes
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" name="hadWill" value="no" defaultChecked /> No
                </label>
              </div>
            </fieldset>
            <label className={labelClass}>
              <span className={labelTextClass}>Will location</span>
              <input type="text" name="willLocation" placeholder="e.g. with lawyer, safety deposit box" className={inputClass} />
            </label>
            <label className={labelClass}>
              <span className={labelTextClass}>Estate value range</span>
              <select name="estateValueRange" className={inputClass}>
                <option value="<$100k">Under $100k</option>
                <option value="$100k-$300k">$100k - $300k</option>
                <option value="$300k-$600k">$300k - $600k</option>
                <option value="$600k+">$600k+</option>
              </select>
            </label>
            <fieldset className="space-y-1">
              <legend className={labelTextClass}>Any real property in BC?</legend>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" name="anyRealProperty" value="yes" /> Yes
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" name="anyRealProperty" value="no" defaultChecked /> No
                </label>
              </div>
            </fieldset>
            <fieldset className="space-y-1">
              <legend className={labelTextClass}>Multiple beneficiaries?</legend>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" name="multipleBeneficiaries" value="yes" /> Yes
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" name="multipleBeneficiaries" value="no" defaultChecked /> No
                </label>
              </div>
            </fieldset>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-4 rounded-3xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_25px_80px_-60px_rgba(15,23,42,0.22)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Additional</p>
          <label className={labelClass}>
            <span className={labelTextClass}>Special circumstances or notes</span>
            <textarea name="specialCircumstances" rows={3} className={inputClass} />
          </label>
        </div>

        <button
          type="submit"
          className="rounded-full bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]"
        >
          Create case
        </button>
      </form>
    </div>
  );
}
