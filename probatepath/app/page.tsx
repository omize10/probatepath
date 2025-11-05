export default function HomePage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold">
        BC Probate documents in hours
      </h1>

      <p className="text-gray-600">
        Fixed 2,500 CAD. You file. We prepare. Click “Start now” to begin.
      </p>

      <div className="flex gap-3">
        <a
          href="/start"
          className="inline-flex items-center rounded-md border px-4 py-2"
        >
          Start now
        </a>

        <a
          href="/how-it-works"
          className="inline-flex items-center rounded-md border px-4 py-2"
        >
          How it works
        </a>
      </div>
    </section>
  );
}
