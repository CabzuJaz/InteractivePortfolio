import { z } from "zod";

export type PrepSheetResult =
  | {
      status: "needs_info";
      missingFields: string[];
      message: string;
    }
  | {
      status: "error";
      message: string;
    }
  | {
      status: "success";
      documentId: string;
      downloadUrl: string;
      clientName: string;
      clientEmail: string;
      businessName?: string | null;
      processDescription: string;
      previewItems: string[];
      message: string;
    };

export interface PrepSheetInput {
  clientName?: string;
  clientEmail?: string;
  businessName?: string;
  processDescription?: string;
  clientSlug?: string;
}

const invalidNameTerms = [
  "automate",
  "automation",
  "business",
  "client",
  "customer",
  "form",
  "interested",
  "process",
  "sheet",
  "start",
  "sure",
  "workflow",
];

const specificProcessTerms = [
  "approval",
  "crm",
  "email",
  "estimate",
  "follow",
  "form",
  "intake",
  "lead",
  "manual",
  "process",
  "repetitive",
  "sync",
  "task",
  "workflow",
];

export function isLikelyClientName(value: string) {
  const name = value.trim();
  const lower = name.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);

  return (
    name.length >= 2 &&
    name.length <= 80 &&
    words.length <= 4 &&
    !/[?@]/.test(name) &&
    !invalidNameTerms.some((term) => lower.includes(term))
  );
}

export function isSpecificProcessDescription(value: string) {
  const description = value.trim();
  const lower = description.toLowerCase();

  if (description.length < 12) return false;
  if (/interested in automation\b.*\b(not sure|where to start|prep\s*-?\s*sheet)/i.test(description)) {
    return false;
  }

  return specificProcessTerms.some((term) => lower.includes(term));
}

export function buildPrepSheetResult(
  input: PrepSheetInput,
  baseUrl: string,
): PrepSheetResult {
  const normalized = {
    clientName: input.clientName?.trim() ?? "",
    clientEmail: input.clientEmail?.trim() ?? "",
    businessName: input.businessName?.trim() ?? "",
    processDescription: input.processDescription?.trim() ?? "",
    clientSlug: input.clientSlug?.trim() ?? "",
  };

  const missingFields: string[] = [];
  if (!isLikelyClientName(normalized.clientName)) missingFields.push("Your name");
  if (!z.string().email().safeParse(normalized.clientEmail).success) {
    missingFields.push("A valid email address");
  }
  if (!isSpecificProcessDescription(normalized.processDescription)) {
    missingFields.push("A brief description of the task or process you want to improve");
  }

  if (missingFields.length > 0) {
    return {
      status: "needs_info",
      missingFields,
      message:
        "I can prepare that for you. Before I generate the prep sheet, please provide the missing details below.",
    };
  }

  try {
    const params = new URLSearchParams();
    if (normalized.clientSlug) params.set("client", normalized.clientSlug);
    params.set("name", normalized.clientName);
    params.set("email", normalized.clientEmail);
    if (normalized.businessName) params.set("business", normalized.businessName);
    params.set("process", normalized.processDescription);

    const downloadUrl = `${baseUrl.replace(/\/$/, "")}/prep?${params.toString()}`;
    const parsedUrl = new URL(downloadUrl);
    const result = {
      success: true,
      documentId: "automation-prep-sheet",
      downloadUrl,
      fileSize: downloadUrl.length,
      previewItems: [
        "Current lead flow and tools",
        "Where time or leads are slipping",
        "What successful automation should change",
      ],
    };

    if (
      !result.success ||
      !result.documentId ||
      !result.downloadUrl ||
      result.fileSize === 0 ||
      parsedUrl.pathname !== "/prep" ||
      result.previewItems.length === 0
    ) {
      console.error("[prep-sheet] Invalid generation result:", result);
      return {
        status: "error",
        message:
          "I couldn't generate the prep sheet right now. No document was created.",
      };
    }

    return {
      status: "success",
      documentId: result.documentId,
      downloadUrl: result.downloadUrl,
      clientName: normalized.clientName,
      clientEmail: normalized.clientEmail,
      businessName: normalized.businessName || null,
      processDescription: normalized.processDescription,
      previewItems: result.previewItems,
      message: "Your prep sheet is ready.",
    };
  } catch (err) {
    console.error("[prep-sheet] generation failed:", err);
    return {
      status: "error",
      message:
        "I couldn't generate the prep sheet right now. No document was created.",
    };
  }
}
