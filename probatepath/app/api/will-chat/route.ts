export async function POST() {
  return new Response(
    JSON.stringify({
      ok: false,
      error: "The AI assistant has been disabled.",
      response: "The AI assistant has been disabled.",
    }),
    { status: 200 },
  );
}
