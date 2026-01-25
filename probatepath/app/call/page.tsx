import { redirect } from "next/navigation";

/**
 * Legacy call page - redirects to new onboard flow
 * The new flow includes phone collection and outbound call at /onboard/call
 */
export default function CallPageRedirect() {
  redirect("/onboard/name");
}
