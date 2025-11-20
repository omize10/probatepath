import { RegisterForm } from "@/app/(auth)/register/register-form";

interface PageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function CreateAccountPage({ searchParams }: PageProps) {
  const searchNext = typeof searchParams?.next === "string" ? searchParams.next : undefined;
  const nextParam = searchNext && searchNext.startsWith("/") ? searchNext : "/start/step-1";

  return (
    <div className="py-20">
      <RegisterForm next={nextParam} variant="start" />
    </div>
  );
}
