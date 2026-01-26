"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Lawyer receipt line items - totals to ~$9,000
const lawyerLineItems = [
  { description: "Initial consultation", amount: 750 },
  { description: "Document review", amount: 1200 },
  { description: "Phone conferences (8)", amount: 960 },
  { description: "Email correspondence", amount: 480 },
  { description: "Form preparation", amount: 1800 },
  { description: "Court filing service", amount: 600 },
  { description: "Administrative fees", amount: 450 },
  { description: "Photocopies & courier", amount: 185 },
  { description: "File management", amount: 350 },
  { description: "Research & due diligence", amount: 425 },
  { description: "Miscellaneous", amount: 800 },
];

const subtotal = lawyerLineItems.reduce((sum, item) => sum + item.amount, 0);
const gst = Math.round(subtotal * 0.05);
const pst = Math.round(subtotal * 0.07);
const lawyerTotal = subtotal + gst + pst;

// Format currency
const formatCurrency = (amount: number) => {
  return amount.toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Animated line item component
function ReceiptLine({
  description,
  amount,
  delay,
  isBold = false,
  isTotal = false,
}: {
  description: string;
  amount: number;
  delay: number;
  isBold?: boolean;
  isTotal?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`flex justify-between font-mono text-sm ${
        isBold ? "font-bold" : ""
      } ${isTotal ? "text-base" : ""}`}
    >
      <span className="flex-1 overflow-hidden">
        {description}
        {!isTotal && (
          <span className="text-gray-400">
            {"".padEnd(30 - description.length, ".")}
          </span>
        )}
      </span>
      <span className={isTotal ? "text-red-600" : ""}>
        $ {formatCurrency(amount)}
      </span>
    </motion.div>
  );
}

// Lawyer Receipt Component
function LawyerReceipt({ isInView }: { isInView: boolean }) {
  const currentMonth = new Date().toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -100, rotate: -5 }}
      animate={
        isInView
          ? { opacity: 1, x: 0, rotate: -2 }
          : { opacity: 0, x: -100, rotate: -5 }
      }
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, rotate: -3 }}
      className="relative w-full max-w-sm cursor-default"
    >
      {/* Paper effect */}
      <div
        className="relative rounded-sm bg-[#faf9f6] p-6 shadow-2xl"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        {/* Paper texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Receipt content */}
        <div className="relative space-y-4 text-gray-700">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center border-b border-gray-300 border-dashed pb-4"
          >
            <h3 className="font-mono text-lg font-bold tracking-tight text-gray-800">
              SMITH & ASSOCIATES
            </h3>
            <p className="font-mono text-xs text-gray-500">
              Barristers & Solicitors
            </p>
          </motion.div>

          {/* Invoice info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.4 }}
            className="font-mono text-xs text-gray-500 space-y-1"
          >
            <p>INVOICE #4892</p>
            <p>Date: {currentMonth}</p>
            <p className="pt-2 text-gray-600">Estate of: Sample Client</p>
          </motion.div>

          {/* Divider */}
          <div className="border-t border-gray-300 border-dashed" />

          {/* Line items */}
          <div className="space-y-1.5">
            {isInView &&
              lawyerLineItems.map((item, index) => (
                <ReceiptLine
                  key={item.description}
                  description={item.description}
                  amount={item.amount}
                  delay={0.5 + index * 0.12}
                />
              ))}
          </div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.8 }}
            className="border-t border-gray-300 border-dashed"
          />

          {/* Subtotals */}
          {isInView && (
            <div className="space-y-1">
              <ReceiptLine
                description="SUBTOTAL"
                amount={subtotal}
                delay={1.9}
              />
              <ReceiptLine description="GST (5%)" amount={gst} delay={2.0} />
              <ReceiptLine description="PST (7%)" amount={pst} delay={2.1} />
            </div>
          )}

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 2.2 }}
            className="border-t-2 border-gray-400"
          />

          {/* Total */}
          {isInView && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.3, type: "spring", stiffness: 200 }}
              className="flex justify-between font-mono text-lg font-bold"
            >
              <span>TOTAL DUE:</span>
              <span className="text-red-600">$ {formatCurrency(lawyerTotal)}</span>
            </motion.div>
          )}

          {/* Fine print */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 2.5 }}
            className="pt-2 font-mono text-[10px] text-gray-400 space-y-0.5"
          >
            <p>* Final amount may vary</p>
            <p>* Additional fees may apply</p>
            <p>* Payment due upon receipt</p>
          </motion.div>
        </div>

        {/* Torn edge effect at bottom */}
        <div
          className="absolute -bottom-2 left-0 right-0 h-4 bg-[#faf9f6]"
          style={{
            clipPath:
              "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)",
          }}
        />
      </div>
    </motion.div>
  );
}

// ProbateDesk Receipt Component
function ProbateDeskReceipt({ isInView }: { isInView: boolean }) {
  const currentDate = new Date().toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
  });

  // Generate a pseudo-receipt number based on current date
  const receiptNumber = `PD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(5, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={
        isInView
          ? { opacity: 1, x: 0, scale: 1 }
          : { opacity: 0, x: 100, scale: 0.9 }
      }
      transition={{ duration: 0.6, delay: 2.8, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative w-full max-w-sm cursor-default"
    >
      {/* Ambient pulsing glow - continuous animation */}
      <motion.div
        className="absolute -inset-3 rounded-xl pointer-events-none"
        animate={{
          boxShadow: [
            "0 0 30px 8px rgba(13, 23, 38, 0.15), 0 0 60px 20px rgba(201, 162, 39, 0.08)",
            "0 0 40px 12px rgba(13, 23, 38, 0.25), 0 0 80px 30px rgba(201, 162, 39, 0.15)",
            "0 0 30px 8px rgba(13, 23, 38, 0.15), 0 0 60px 20px rgba(201, 162, 39, 0.08)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Premium paper card */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          background: "linear-gradient(to bottom, #ffffff 0%, #faf9f6 100%)",
          boxShadow:
            "0 25px 50px -12px rgba(13, 23, 38, 0.25), 0 0 0 1px rgba(13, 23, 38, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {/* Subtle paper texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Corner flourish - top right */}
        <div className="absolute top-0 right-0 w-16 h-16 opacity-[0.04] pointer-events-none">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M64 0C64 35.3 35.3 64 0 64" stroke="#0d1726" strokeWidth="1"/>
            <path d="M64 16C64 42.5 42.5 64 16 64" stroke="#0d1726" strokeWidth="1"/>
            <path d="M64 32C64 49.7 49.7 64 32 64" stroke="#0d1726" strokeWidth="1"/>
          </svg>
        </div>

        {/* Receipt content */}
        <div className="relative p-6 space-y-5 text-gray-900">
          {/* Logo/Header - ProbateDesk.com */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            transition={{ delay: 3.0 }}
            className="text-center pb-4 border-b border-[#d6d0c6]"
          >
            <div className="inline-block px-5 py-2.5 bg-[#0d1726] rounded-lg shadow-md">
              <span className="text-white font-semibold text-lg tracking-tight">
                ProbateDesk
              </span>
              <span className="text-[#c9a227] font-semibold text-lg">.com</span>
            </div>
          </motion.div>

          {/* Receipt metadata */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 3.1 }}
            className="flex justify-between items-baseline"
          >
            <div>
              <p className="text-[10px] font-semibold text-[#445266] tracking-[0.25em] uppercase">
                Official Receipt
              </p>
              <p className="text-[10px] text-[#6b7280] mt-0.5 font-mono">
                {receiptNumber}
              </p>
            </div>
            <p className="text-[11px] text-[#6b7280]">{currentDate}</p>
          </motion.div>

          {/* Divider */}
          <div className="border-t border-[#d6d0c6] border-dashed" />

          {/* Main item */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 3.2 }}
            className="space-y-3"
          >
            <h4 className="text-lg font-semibold text-[#0d1726]">
              BC Probate Document Package
            </h4>
            <ul className="space-y-2.5 text-sm text-[#374151]">
              <li className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0d1726]" />
                Court-ready P1, P2, P3 forms
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0d1726]" />
                Specialist review
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0d1726]" />
                Filing guidance included
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0d1726]" />
                Support when you need it
              </li>
            </ul>
          </motion.div>

          {/* Divider */}
          <div className="border-t border-[#d6d0c6]" />

          {/* Total - single display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ delay: 3.4, type: "spring", stiffness: 200 }}
            className="text-center py-2"
          >
            <p className="text-[10px] text-[#6b7280] uppercase tracking-[0.2em] mb-1">Total</p>
            <p className="text-3xl font-bold text-[#0d1726]">$799.00</p>
            <p className="text-[10px] text-[#9ca3af] mt-1">CAD + applicable taxes</p>
          </motion.div>

          {/* Divider */}
          <div className="border-t border-[#d6d0c6]" />

          {/* Embossed PAID seal - softer edges with depth */}
          <motion.div
            initial={{ opacity: 0, scale: 1.3, y: -30 }}
            animate={
              isInView
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 0, scale: 1.3, y: -30 }
            }
            transition={{
              delay: 3.7,
              type: "spring",
              stiffness: 400,
              damping: 20,
            }}
            className="flex items-center justify-center py-3"
          >
            {/* Outer ring for depth */}
            <div
              className="relative p-1 rounded-full"
              style={{
                background: "linear-gradient(145deg, rgba(13,23,38,0.1) 0%, rgba(201,162,39,0.15) 100%)",
              }}
            >
              {/* Main seal with softer edges */}
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, #1c2434 0%, #0d1726 40%, #0a1220 100%)",
                  boxShadow: "inset 0 3px 6px rgba(255,255,255,0.12), inset 0 -3px 6px rgba(0,0,0,0.25), 0 6px 20px rgba(13,23,38,0.5), 0 2px 8px rgba(201,162,39,0.2)",
                }}
                animate={{
                  boxShadow: [
                    "inset 0 3px 6px rgba(255,255,255,0.12), inset 0 -3px 6px rgba(0,0,0,0.25), 0 6px 20px rgba(13,23,38,0.5), 0 2px 8px rgba(201,162,39,0.15)",
                    "inset 0 3px 6px rgba(255,255,255,0.15), inset 0 -3px 6px rgba(0,0,0,0.25), 0 8px 25px rgba(13,23,38,0.6), 0 4px 12px rgba(201,162,39,0.25)",
                    "inset 0 3px 6px rgba(255,255,255,0.12), inset 0 -3px 6px rgba(0,0,0,0.25), 0 6px 20px rgba(13,23,38,0.5), 0 2px 8px rgba(201,162,39,0.15)",
                  ],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 4,
                }}
              >
                <div className="text-center">
                  <div className="text-sm font-bold tracking-[0.25em] text-white/95">PAID</div>
                  <div className="text-[8px] tracking-[0.15em] text-[#c9a227]/70 mt-0.5">IN FULL</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Thank you / Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 3.9 }}
            className="text-center space-y-1 pt-2 border-t border-[#d6d0c6]"
          >
            <p className="text-sm text-[#6b7280]">
              Thank you for choosing ProbateDesk.
            </p>
            <p className="text-[10px] text-[#9ca3af]">
              Questions? hello@probatedesk.ca
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Main Section Component
export function ReceiptComparison() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#111111] py-24 md:py-32"
    >
      {/* Top fade from white - long and gradual */}
      <div
        className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, white 0%, rgba(255,255,255,0.8) 30%, rgba(255,255,255,0.3) 60%, transparent 100%)'
        }}
      />

      {/* Bottom fade to white - long and gradual */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, white 0%, rgba(255,255,255,0.8) 30%, rgba(255,255,255,0.3) 60%, transparent 100%)'
        }}
      />

      <div className="mx-auto max-w-6xl px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-[4px] text-gray-300 mb-4">
            The Real Cost
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Where does your money actually go?
          </h2>
          <p className="text-lg text-gray-300 max-w-xl mx-auto">
            The same court forms. Very different bills.
          </p>
        </motion.div>

        {/* Receipts Container */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 lg:gap-24">
          <LawyerReceipt isInView={isInView} />
          <ProbateDeskReceipt isInView={isInView} />
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 4.2, duration: 0.5 }}
          className="text-center mt-16"
        >
          <Button
            asChild
            size="lg"
            className="bg-emerald-500 px-8 py-6 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30"
          >
            <Link href="/onboard/name">
              Get started today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 4.4 }}
          className="text-center text-xs text-gray-500 mt-8 max-w-xl mx-auto"
        >
          *Lawyer fees based on industry surveys of BC probate services. Actual
          costs vary. ProbateDesk pricing is fixed with no hidden fees.
        </motion.p>
      </div>
    </section>
  );
}
