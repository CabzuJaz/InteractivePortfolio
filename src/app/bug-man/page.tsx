import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BUG_MAN_COOKIE, isUnlocked } from "@/lib/bug-man/auth";
import BugManLogin from "./login-client";

/**
 * The lock screen lives on its own route so it gets its own client bundle.
 *
 * When the dashboard was imported from this file — statically or via
 * next/dynamic — the bundler placed it in this route's client entry, and that
 * chunk is served to locked visitors. It carried the client's name, systems and
 * scope, which defeated the gate. Splitting the routes is what actually keeps
 * the dashboard out of a locked visitor's hands.
 */
export default async function BugManPage() {
  const store = await cookies();

  if (isUnlocked(store.get(BUG_MAN_COOKIE)?.value)) {
    redirect("/bug-man/dashboard");
  }

  return <BugManLogin />;
}
