import { Bug } from "lucide-react";

/**
 * Shared between the locked and unlocked views. It lives in its own file so the
 * login screen never imports the dashboard bundle, which would ship the client's
 * details to visitors who have not entered the passphrase.
 */
export function BugMark() {
  return (
    <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
      <Bug className="size-5" strokeWidth={2.4} />
    </div>
  );
}
