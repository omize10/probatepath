import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let serviceClient: SupabaseClient | null = null;
let anonClient: SupabaseClient | null = null;

function assertUrl() {
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be set");
  }
}

export function getSupabaseServiceClient(): SupabaseClient {
  assertUrl();
  if (!supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must be set for server-side uploads");
  }
  if (!serviceClient) {
    serviceClient = createClient(supabaseUrl!, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return serviceClient;
}

export function getSupabaseAnonClient(): SupabaseClient {
  assertUrl();
  if (!supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY must be set");
  }
  if (!anonClient) {
    anonClient = createClient(supabaseUrl!, supabaseAnonKey);
  }
  return anonClient;
}

export async function uploadFileToBucket(params: {
  bucket: string;
  path: string;
  content: ArrayBuffer;
  contentType?: string;
}) {
  const { bucket, path, content, contentType } = params;
  const supabase = getSupabaseServiceClient();
  return supabase.storage.from(bucket).upload(path, content, { contentType, cacheControl: "3600", upsert: false });
}

export async function downloadFileFromBucket(bucket: string, path: string) {
  const supabase = getSupabaseServiceClient();
  return supabase.storage.from(bucket).download(path);
}
