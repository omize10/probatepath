import Link from "next/link";
import { LoginForm } from "@/app/(auth)/login/login-form";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const nextParam = typeof params?.next === "string" && params.next.startsWith("/") ? params.next : "/portal";
  const emailCodeAuthEnabled = process.env.ENABLE_EMAIL_CODE_AUTH === 'true';

  return (
    <div className="py-20">
      <LoginForm next={nextParam} emailCodeAuthEnabled={emailCodeAuthEnabled} />
      <div className="mt-4 text-center">
        <Link href="/forgot-password" className="text-sm text-sky-600 hover:underline">
          Forgot password?
        </Link>
      </div>
    </div>
  );
}
