import { RegisterForm } from "@/app/(auth)/register/register-form";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function RegisterPage({ searchParams }: PageProps) {
  const nextParam = typeof searchParams?.next === "string" && searchParams.next.startsWith("/") ? searchParams.next : "/portal";
  return (
    <div className="py-20">
      <RegisterForm next={nextParam} />
    </div>
  );
}
