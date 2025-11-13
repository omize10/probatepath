export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockGeneratePacket() {
  await wait(1200);
  return {
    ok: true,
    url: "/images/envelope.jpg",
    generatedAt: new Date().toISOString(),
  } as const;
}

export async function mockBookNotary() {
  await wait(1000);
  return {
    ok: true,
    confirmation: `ODL-${Math.floor(Math.random() * 9000 + 1000)}`,
  } as const;
}

export async function mockCreatePack() {
  await wait(1400);
  return {
    ok: true,
    pages: 32,
  } as const;
}

export async function mockMarkComplete() {
  await wait(400);
  return { ok: true } as const;
}
