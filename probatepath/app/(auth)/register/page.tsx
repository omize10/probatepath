import { RegisterForm } from "@/app/(auth)/register/register-form";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const nextParam = typeof params?.next === "string" && params.next.startsWith("/") ? params.next : "/portal/pricing";
  return (
    <div className="py-20">
      <RegisterForm next={nextParam} />
    </div>
  );
}
