import { RegisterForm } from "@/app/(auth)/register/register-form";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CreateAccountPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchNext = typeof params?.next === "string" ? params.next : undefined;
  const nextParam = searchNext && searchNext.startsWith("/") ? searchNext : "/start";

  return (
    <div className="py-20">
      <RegisterForm next={nextParam} variant="start" />
    </div>
  );
}
