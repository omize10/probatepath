'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, FileText, Scale, DollarSign, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExplainerPage() {
  const router = useRouter();

  return (
    <div className="space-y-8 max-w-2xl mx-auto">

      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)]">
          What you need to know
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          A quick overview before we continue
        </p>
      </div>

      {/* What is probate */}
      <section className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-blue-100 p-3">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--brand)] mb-2">What is Probate?</h2>
            <p className="text-[color:var(--muted-ink)]">
              Probate is getting the court's official permission to handle someone's estate.
              Banks, land title offices, and other institutions won't let you access assets without it.
              If there was a will, you apply for a <strong>"Grant of Probate"</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* What is administration */}
      <section className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-purple-100 p-3">
            <Scale className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--brand)] mb-2">What if there's no will?</h2>
            <p className="text-[color:var(--muted-ink)]">
              If there's no will, it's called <strong>"Administration"</strong> instead of Probate.
              Similar process, different paperwork. The court decides who can administer the estate
              based on BC's intestacy rules. We handle both types.
            </p>
          </div>
        </div>
      </section>

      {/* Our pricing */}
      <section className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-green-100 p-3">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[color:var(--brand)] mb-2">Our Pricing</h2>
            <p className="text-[color:var(--muted-ink)] mb-4">
              Lawyers typically charge <strong>$8,000 - $15,000</strong> for probate.
              We offer fixed pricing with no surprises:
            </p>

            <div className="space-y-3">
              {/* Essentials */}
              <div className="rounded-xl border border-[color:var(--border-muted)] p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-[color:var(--brand)]">Essentials</p>
                    <p className="text-sm text-[color:var(--muted-ink)]">All forms and instructions. You review and file yourself.</p>
                  </div>
                  <p className="text-lg font-bold text-[color:var(--brand)]">$799</p>
                </div>
              </div>

              {/* Guided - Most Popular */}
              <div className="rounded-xl border-2 border-[color:var(--brand)] bg-[color:var(--bg-muted)] p-4 relative">
                <span className="absolute -top-3 right-4 bg-[color:var(--brand)] text-white text-xs px-3 py-1 rounded-full font-medium">
                  MOST POPULAR
                </span>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-[color:var(--brand)]">Guided</p>
                    <p className="text-sm text-[color:var(--muted-ink)]">We review everything before you file. Catch mistakes before the court does.</p>
                  </div>
                  <p className="text-lg font-bold text-[color:var(--brand)]">$1,499</p>
                </div>
              </div>

              {/* Full Service */}
              <div className="rounded-xl border border-[color:var(--border-muted)] p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-[color:var(--brand)]">Full Service</p>
                    <p className="text-sm text-[color:var(--muted-ink)]">A lawyer handles everything. You just sign.</p>
                  </div>
                  <p className="text-lg font-bold text-[color:var(--brand)]">$2,499</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we check */}
      <section className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
        <h2 className="text-lg font-semibold text-[color:var(--brand)] mb-4">We'll ask you about:</h2>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 text-[color:var(--muted-ink)]">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span>Whether there's a will (and if you have the original)</span>
          </li>
          <li className="flex items-center gap-3 text-[color:var(--muted-ink)]">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span>If there are any disputes or complications</span>
          </li>
          <li className="flex items-center gap-3 text-[color:var(--muted-ink)]">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span>The approximate estate value</span>
          </li>
          <li className="flex items-center gap-3 text-[color:var(--muted-ink)]">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span>Whether assets are all in Canada</span>
          </li>
        </ul>
      </section>

      {/* Continue button */}
      <div className="space-y-3">
        <Button
          onClick={() => router.push('/onboard/screening')}
          size="lg"
          className="w-full h-14 text-lg"
        >
          I understand, continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          onClick={() => router.push('/onboard/call')}
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to call
        </Button>
      </div>

    </div>
  );
}
