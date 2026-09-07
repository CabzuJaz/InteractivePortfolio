import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BUG_MAN_COOKIE, isUnlocked } from "@/lib/bug-man/auth";
import BugManDashboard from "./dashboard-client";

/** Gated on the server: a visitor without the passphrase is sent back to the lock screen. */
export default async function BugManDashboardPage() {
  const store = await cookies();

  if (!isUnlocked(store.get(BUG_MAN_COOKIE)?.value)) {
    redirect("/bug-man");
  }

  return <BugManDashboard />;
}
