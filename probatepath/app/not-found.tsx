import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-serif">Page not found</h1>
        <p className="mt-4 text-sm text-[color:var(--text-secondary)]">
          We couldn't find the page you're looking for. It may have moved or never existed.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/" className="text-sm underline">
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
