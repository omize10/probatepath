type FAQ = { question: string; answer: string };

export function FAQSection({ faqs, title = "Frequently asked questions" }: { faqs: FAQ[]; title?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <section className="mt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <h2 id="faq" className="mb-8 font-serif text-2xl text-[color:var(--brand)]">{title}</h2>
      <div className="space-y-6">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
            <h3 className="mb-3 text-lg font-semibold text-[color:var(--brand)]">{faq.question}</h3>
            <p className="text-[color:var(--muted-ink)]">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
