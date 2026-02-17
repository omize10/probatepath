import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PuckPage } from "@/lib/puck/render-page";
import type { Data } from "@puckeditor/core";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const slugStr = slug.join("/");

  try {
    const row = await prisma.pageContent.findUnique({ where: { slug: slugStr } });
    if (!row) return {};

    const data = row.data as unknown as Data;
    const rootProps = data?.root?.props as Record<string, unknown> | undefined;

    return {
      title: (rootProps?.metaTitle as string) || undefined,
      description: (rootProps?.metaDescription as string) || undefined,
    };
  } catch {
    return {};
  }
}

export default async function PuckRenderPage({ params }: Props) {
  const { slug } = await params;
  const slugStr = slug.join("/");

  let data: Data | null = null;

  try {
    const row = await prisma.pageContent.findUnique({ where: { slug: slugStr } });
    if (row) {
      data = row.data as unknown as Data;
    }
  } catch {
    // DB error — fall through to notFound
  }

  if (!data) return notFound();

  return <PuckPage data={data} />;
}
