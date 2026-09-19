/**
 * GoHighLevel (GHL) conversation logger.
 * When the visitor has typed an email or phone number, finds or creates their
 * contact and keeps one note per conversation holding the full transcript.
 * Requires GHL_LOCATION_ID and GHL_API_KEY env vars.
 */

import type { ConversationEntry } from "../types";
import { GHL_BASE, ghlHeaders } from "../ghl/client";
import { findCompany, findName } from "./contact-info";

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

  const { firstName, lastName } = findName(allText);
  const company = findCompany(allText);

  return {
    email: emailMatch?.[0] ?? undefined,
    phone: validPhone,
    firstName,
    lastName,
    company,
  };
}

const CHAT_TAG = "portfolio-chat-lead";

/**
 * Finds or creates the visitor's contact, tags it, and writes this
 * conversation's transcript into a single note that is rewritten each turn.
 */
export async function sendToGHL(
  conversations: ConversationEntry[],
  conversationId: string,
): Promise<void> {
  const locationId = process.env.GHL_LOCATION_ID;
  const apiKey = process.env.GHL_API_KEY;
  if (!locationId || !apiKey) return;

  const baseUrl = GHL_BASE;
  const headers = ghlHeaders();

  const info = extractContactInfo(conversations);

  // Only create contact if we have at least an email or phone
  if (!info.email && !info.phone) {
    console.log("[ghl] No contact info extracted — skipping contact creation");
    return;
  }

  let contactId: string | undefined;
  let created = false;

  try {
    // Search by email, or by phone when that's all the visitor gave, so a
    // phone-only visitor doesn't get a new contact on every turn.
    const query = info.email ?? info.phone;
    if (query) {
      const searchRes = await fetch(
        `${baseUrl}/contacts/?locationId=${locationId}&query=${encodeURIComponent(query)}&limit=1`,
        { headers },
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        contactId = searchData.contacts?.[0]?.id;
      }
    }

    if (!contactId) {
      const contactPayload: Record<string, unknown> = {
        locationId,
        source: "Portfolio Chat Widget",
        tags: [CHAT_TAG],
      };
      if (info.firstName) contactPayload.firstName = info.firstName;
      if (info.lastName) contactPayload.lastName = info.lastName;
      if (info.email) contactPayload.email = info.email;
      if (info.phone) contactPayload.phone = info.phone;
      if (info.company) contactPayload.companyName = info.company;

      const createRes = await fetch(`${baseUrl}/contacts/`, {
        method: "POST",
        headers,
        body: JSON.stringify(contactPayload),
      });
      if (createRes.ok) {
        const createData = await createRes.json();
        contactId = createData.contact?.id;
        created = true;
        console.log("[ghl] Contact created:", contactId);
      } else {
        console.error("[ghl] Contact creation failed:", createRes.status, await createRes.text());
      }
    }
  } catch (err) {
    console.error("[ghl] Contact lookup failed:", err);
    return;
  }

  if (!contactId) {
    console.error("[ghl] No contact ID — skipping note");
    return;
  }

  // An existing contact's details are left exactly as they are; chat text is
  // a poor source for overwriting a CRM record. The tag goes through Add Tags
  // because the update endpoint's `tags` field replaces every tag the contact
  // has (per HighLevel's spec), which would strip tags like proposal-sent.
  if (!created) {
    try {
      const tagRes = await fetch(`${baseUrl}/contacts/${contactId}/tags`, {
        method: "POST",
        headers,
        body: JSON.stringify({ tags: [CHAT_TAG] }),
      });
      if (!tagRes.ok) {
        console.error("[ghl] Adding tag failed:", tagRes.status, await tagRes.text());
      }
    } catch (err) {
      console.error("[ghl] Adding tag failed:", err);
    }
  }

  const transcript = conversations
    .map(
      (c) =>
        `**${c.role === "user" ? "Client" : "Jazz AI"}:** ${c.text}`,
    )
    .join("\n\n");

  // The marker is how a later turn finds this conversation's note to rewrite.
  const marker = `Conversation ID: ${conversationId}`;
  const userMessages = conversations.filter((c) => c.role === "user");
  const noteBody = [
    `💬 **Portfolio Chat Conversation**`,
    `📅 ${new Date().toLocaleString()}`,
    `📊 ${conversations.length} messages (${userMessages.length} from client)`,
    `🔖 ${marker}`,
    ``,
    `---`,
    ``,
    transcript,
  ].join("\n");

  try {
    let noteId: string | undefined;
    const listRes = await fetch(`${baseUrl}/contacts/${contactId}/notes`, { headers });
    if (listRes.ok) {
      const { notes } = (await listRes.json()) as { notes?: { id: string; body?: string }[] };
      noteId = notes?.find((note) => note.body?.includes(marker))?.id;
    }

    const noteRes = await fetch(
      noteId ? `${baseUrl}/contacts/${contactId}/notes/${noteId}` : `${baseUrl}/contacts/${contactId}/notes`,
      { method: noteId ? "PUT" : "POST", headers, body: JSON.stringify({ body: noteBody }) },
    );
    if (noteRes.ok) {
      console.log(`[ghl] Note ${noteId ? "updated" : "added"} on contact:`, contactId);
    } else {
      console.error("[ghl] Note write failed:", noteRes.status, await noteRes.text());
    }
  } catch (err) {
    console.error("[ghl] Note write failed:", err);
  }
}
