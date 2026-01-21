import { redirect } from "next/navigation";

export default function StartPage() {
  // Redirect to screening first - users must pass eligibility check before pricing
  redirect("/portal/screening");
}
