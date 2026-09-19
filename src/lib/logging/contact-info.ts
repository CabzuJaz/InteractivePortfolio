/**
 * Pulls a visitor's name and company out of chat text, conservatively. A wrong
 * guess ends up as a CRM contact field, so these only fire on explicit
 * phrasing followed by capitalized words: "my name is Ana Cruz", "I work at
 * Acme Corp". Loose patterns read "I am curious the hours" as a person named
 * "curious the" and "lead capture from WPForms" as a company called WPForms.
 */

// Capitalized words that commonly follow "I'm" / "I am" / "this is" but aren't names.
const NOT_NAMES = new Set([
  "looking", "trying", "interested", "wondering", "thinking", "planning",
  "hoping", "searching", "working", "building", "running", "helping",
  "currently", "actually", "really", "very", "just", "also", "still",
  "need", "want", "have", "been", "would", "could", "should", "might",
  "here", "there", "what", "where", "when", "how", "this", "that",
  "from", "with", "about", "into", "more", "some", "many", "each",
  "curious", "confused", "new", "not", "sure", "glad", "happy", "sorry",
]);

/** The run of capitalized words right after the first matching lead-in, if any. */
function capitalizedAfter(text: string, leadIn: RegExp, maxWords: number): string | undefined {
  // No periods inside a word, so a run stops at the end of a sentence ("Mark. Our").
  const words = new RegExp(`^[A-Z][\\w&'-]*(?:\\s+[A-Z][\\w&'-]*){0,${maxWords - 1}}`);
  for (const match of text.matchAll(leadIn)) {
    const found = text.slice((match.index ?? 0) + match[0].length).match(words)?.[0];
    if (found && !NOT_NAMES.has(found.split(/\s+/)[0].toLowerCase())) return found;
  }
  return undefined;
}

export function findName(text: string): { firstName?: string; lastName?: string } {
  const found = capitalizedAfter(text, /\b(?:my name is|this is|i'm|i am)\s+/gi, 2);
  if (!found) return {};
  const [firstName, lastName] = found.split(/\s+/);
  return { firstName, lastName: lastName && !NOT_NAMES.has(lastName.toLowerCase()) ? lastName : undefined };
}

export function findCompany(text: string): string | undefined {
  return capitalizedAfter(
    text,
    /\b(?:my company is|our company is|company name is|company:|i work at|i work for)\s+/gi,
    4,
  );
}
