/**
 * Working pace a contract assumes: about 20 hours a week, the same ~80 hours a
 * month that tool subscriptions are billed against.
 */
export const CONTRACT_HOURS_PER_WEEK = 20;

/** Calendar length of a build, e.g. "1 week", "3 weeks", or "4 months" past two months. */
export function formatContractTimeline(hours: number): string {
  const weeks = Math.max(1, Math.ceil(hours / CONTRACT_HOURS_PER_WEEK));
  if (weeks <= 8) return `${weeks} week${weeks === 1 ? "" : "s"}`;
  return `${Math.ceil(weeks / 4)} months`;
}
