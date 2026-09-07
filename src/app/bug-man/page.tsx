import { cookies } from "next/headers";
import { BUG_MAN_COOKIE, isUnlocked } from "@/lib/bug-man/auth";
import BugManDashboard from "./dashboard-client";
import BugManLogin from "./login-client";

/**
 * The gate runs on the server, so a visitor without the passphrase never
 * receives the dashboard bundle — and with it the client's name, systems, and
 * project scope. A client-side check would have shipped all of that anyway.
 */
export default async function BugManPage() {
  const store = await cookies();

  if (!isUnlocked(store.get(BUG_MAN_COOKIE)?.value)) {
    return <BugManLogin />;
  }

  return <BugManDashboard />;
}
