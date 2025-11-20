import Link from "next/link";
import { LoginForm } from "@/app/(auth)/login/login-form";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function LoginPage({ searchParams }: PageProps) {
  const nextParam = typeof searchParams?.next === "string" && searchParams.next.startsWith("/") ? searchParams.next : "/portal";
  return (
    <div className="py-20">
      <LoginForm next={nextParam} />
      <div className="mt-4 text-center">
        <Link href="/forgot-password" className="text-sm text-sky-600 hover:underline">
          Forgot password?
        </Link>
      </div>
    </div>
  );
}
