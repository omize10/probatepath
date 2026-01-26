import { redirect } from "next/navigation";

/**
 * Legacy quiz page - redirects to new onboard flow
 * The new flow includes screening questions at /onboard/screening
 */
export default function QuizPageRedirect() {
  redirect("/onboard/executor");
}
