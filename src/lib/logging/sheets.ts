/**
 * Appends a conversation row to Google Sheets.
 * Requires GOOGLE_SHEETS_ID and GOOGLE_SERVICE_ACCOUNT_JSON env vars.
 */
import { google } from "googleapis";

interface ConversationEntry {
  role: "user" | "assistant";
  text: string;
}

export async function sendToSheets(
  conversations: ConversationEntry[],
): Promise<void> {
  const sheetsId = process.env.GOOGLE_SHEETS_ID;
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!sheetsId || !credentialsJson) return;

  const credentials = JSON.parse(credentialsJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const userMessages = conversations.filter((c) => c.role === "user");
  const assistantMessages = conversations.filter((c) => c.role === "assistant");

  const timestamp = new Date().toISOString();
  const clientMessages = userMessages.map((m) => m.text).join(" | ");
  const aiResponses = assistantMessages
    .map((m) => m.text.slice(0, 200))
    .join(" | ");
  const messageCount = conversations.length;

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetsId,
    range: "Sheet1!A:E",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[timestamp, clientMessages, aiResponses, messageCount]],
    },
  });
}
