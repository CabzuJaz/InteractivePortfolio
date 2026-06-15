/**
 * GoHighLevel (GHL) conversation logger.
 * Creates/updates a contact and adds the full conversation as a note.
 * Requires GHL_LOCATION_ID and GHL_API_KEY env vars.
 */

import type { ConversationEntry } from "../types";

// Common verbs/adjectives that are NOT names
const NOT_NAMES = new Set([
  "looking", "trying", "interested", "wondering", "thinking", "planning",
  "hoping", "searching", "working", "building", "running", "helping",
  "currently", "actually", "really", "very", "just", "also", "still",
  "need", "want", "have", "been", "would", "could", "should", "might",
  "here", "there", "what", "where", "when", "how", "this", "that",
  "from", "with", "about", "into", "more", "some", "many", "each",
]);

/**
 * Attempts to extract contact info from the conversation.
 * Only returns values that are clearly identifiable — no guessing.
 */
function extractContactInfo(conversations: ConversationEntry[]) {
  const allText = conversations
    .filter((c) => c.role === "user")
    .map((c) => c.text)
    .join(" ");

  // Extract email — reliable
  const emailMatch = allText.match(
    /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/,
  );

  // Extract phone — only if it looks like a real phone number (7+ digits)
  const phoneMatch = allText.match(
    /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/,
  );
  const phone = phoneMatch?.[0];
  const phoneDigits = phone?.replace(/\D/g, "") ?? "";
  const validPhone = phoneDigits.length >= 7 ? phone : undefined;

  // Extract name — ONLY from explicit "my name is X" or "I'm FirstName LastName"
  let firstName: string | undefined;
  let lastName: string | undefined;

  const explicitNameMatch = allText.match(
    /(?:my name is|i'm|i am)\s+([A-Z][a-z]+)(\s+[A-Z][a-z]+)?/i,
  );
  if (explicitNameMatch) {
    const candidate = explicitNameMatch[1];
    if (!NOT_NAMES.has(candidate.toLowerCase())) {
      firstName = candidate;
      if (explicitNameMatch[2]) {
        const last = explicitNameMatch[2].trim();
        if (!NOT_NAMES.has(last.toLowerCase())) {
          lastName = last;
        }
      }
    }
  }

  // Extract company — ONLY from "from X" or "at X" followed by a capitalized word
  let company: string | undefined;
  const companyMatch = allText.match(
    /(?:from|at)\s+([A-Z][\w]+(?:\s+(?:Inc|LLC|Corp|Ltd|Co|Group|Labs|Tech|Solutions|Services))?)/i,
  );
  if (companyMatch) {
    const candidate = companyMatch[1].trim();
    if (!NOT_NAMES.has(candidate.toLowerCase()) && candidate.length > 1) {
      company = companyMatch[0].replace(/^(?:from|at)\s+/i, "").trim();
    }
  }

  return {
    email: emailMatch?.[0] ?? undefined,
    phone: validPhone,
    firstName,
    lastName,
    company,
  };
}

/**
 * Creates or updates a contact in GHL and adds the conversation as a note.
 */
export async function sendToGHL(
  conversations: ConversationEntry[],
): Promise<void> {
  const locationId = process.env.GHL_LOCATION_ID;
  const apiKey = process.env.GHL_API_KEY;
  if (!locationId || !apiKey) return;

  const baseUrl = "https://services.leadconnectorhq.com";
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Version: "2021-07-28",
  };

  const info = extractContactInfo(conversations);

  // Only create contact if we have at least an email or phone
  if (!info.email && !info.phone) {
    console.log("[ghl] No contact info extracted — skipping contact creation");
    return;
  }

  // Create or update contact
  const contactPayload: Record<string, unknown> = {
    locationId,
    source: "Portfolio Chat Widget",
    tags: ["portfolio-chat-lead"],
  };
  if (info.firstName) contactPayload.firstName = info.firstName;
  if (info.lastName) contactPayload.lastName = info.lastName;
  if (info.email) contactPayload.email = info.email;
  if (info.phone) contactPayload.phone = info.phone;
  if (info.company) contactPayload.companyName = info.company;

  let contactId: string | undefined;

  try {
    // Try to find existing contact by email
    if (info.email) {
      const searchRes = await fetch(
        `${baseUrl}/contacts/?locationId=${locationId}&query=${encodeURIComponent(info.email)}&limit=1`,
        { headers },
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        contactId = searchData.contacts?.[0]?.id;
      }
    }

    if (contactId) {
      // Update existing contact
      const updateRes = await fetch(`${baseUrl}/contacts/${contactId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(contactPayload),
      });
      if (!updateRes.ok) {
        console.error("[ghl] Contact update failed:", updateRes.status, await updateRes.text());
      }
    } else {
      // Create new contact
      const createRes = await fetch(`${baseUrl}/contacts/`, {
        method: "POST",
        headers,
        body: JSON.stringify(contactPayload),
      });
      if (createRes.ok) {
        const createData = await createRes.json();
        contactId = createData.contact?.id;
        console.log("[ghl] Contact created:", contactId);
      } else {
        console.error("[ghl] Contact creation failed:", createRes.status, await createRes.text());
      }
    }
  } catch (err) {
    console.error("[ghl] Contact creation failed:", err);
    return;
  }

  if (!contactId) {
    console.error("[ghl] No contact ID — skipping note");
    return;
  }

  // Build conversation transcript for the note
  const transcript = conversations
    .map(
      (c) =>
        `**${c.role === "user" ? "Client" : "Jazz AI"}:** ${c.text}`,
    )
    .join("\n\n");

  const userMessages = conversations.filter((c) => c.role === "user");
  const noteBody = [
    `💬 **Portfolio Chat Conversation**`,
    `📅 ${new Date().toLocaleString()}`,
    `📊 ${conversations.length} messages (${userMessages.length} from client)`,
    ``,
    `---`,
    ``,
    transcript,
  ].join("\n");

  try {
    const noteRes = await fetch(`${baseUrl}/contacts/${contactId}/notes`, {
      method: "POST",
      headers,
      body: JSON.stringify({ body: noteBody }),
    });
    if (noteRes.ok) {
      console.log("[ghl] Note added to contact:", contactId);
    } else {
      console.error("[ghl] Note creation failed:", noteRes.status, await noteRes.text());
    }
  } catch (err) {
    console.error("[ghl] Note creation failed:", err);
  }
}
