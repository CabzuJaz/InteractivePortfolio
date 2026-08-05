"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  DollarSign,
  Clock,
  Wrench,
  CheckCircle,
  Calculator,
  Download,
  Send,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ToolSubscription {
  name: string;
  cost: number;
  period: string;
  note?: string;
}

interface FeatureBreakdownItem {
  deliverable: string;
  hours: number;
}

interface PricingFactors {
  complexity: string;
  clientType: string;
  rateRange: string;
  selectedRate: string;
}

interface ContractData {
  clientName: string;
  clientEmail?: string | null;
  projectDescription: string;
  hourlyRate: number;
  hours: number;
  laborCost: number;
  toolSubscriptions: ToolSubscription[];
  monthlyToolCost: number;
  projectDurationMonths: number;
  totalToolCost: number;
  totalCost: number;
  featureBreakdown?: FeatureBreakdownItem[];
  pricingFactors?: PricingFactors;
  terms: string[];
}

interface DeliveryData {
  sent: boolean;
  method: "ghl-email" | "resend" | "none";
  sentTo: string | null;
  pdfUrl: string | null;
}

interface ContractProps {
  contract?: ContractData;
  delivery?: DeliveryData;
  contractQualification?: {
    status: "needs_info";
    message: string;
    missingFields: string[];
    questions: string[];
  };
}

export function Contract({ contract, delivery, contractQualification }: ContractProps) {
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (contractQualification?.status === "needs_info") {
    return (
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
          className="overflow-hidden rounded-2xl border border-border/50 bg-card"
        >
          <div className="border-b border-border/50 bg-primary/5 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Scope Details Needed</h3>
                <p className="text-sm text-muted-foreground">No formal contract was created yet.</p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {contractQualification.message}
            </p>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Missing Details
              </p>
              <ul className="space-y-1.5">
                {contractQualification.missingFields.map((field) => (
                  <li key={field} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-0.5 text-primary">•</span>
                    {field}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Questions To Confirm
              </p>
              <ol className="list-inside list-decimal space-y-1.5 text-sm text-muted-foreground">
                {contractQualification.questions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ol>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!contract) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { generateContractPDF } = await import("./ContractPDF");
      const blob = await generateContractPDF(contract);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contract-${contract.clientName.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const { generateContractPDF } = await import("./ContractPDF");
      const blob = await generateContractPDF(contract);
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const res = await fetch("/api/send-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: contract.clientName,
          clientEmail: contract.clientEmail,
          totalCost: contract.totalCost,
          pdfBase64: base64,
        }),
      });

      if (res.ok) {
        setSent(true);
      }
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
        className="rounded-2xl border border-border/50 bg-card overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-border/50 bg-primary/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Contract Proposal</h3>
              <p className="text-sm text-muted-foreground">
                Prepared for {contract.clientName}
              </p>
            </div>
          </div>
          <p className="text-sm mt-2">{contract.projectDescription}</p>
        </div>

        {/* Rate Card */}
        <div className="p-5 space-y-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              <DollarSign className="w-3.5 h-3.5" />
              Rate Card
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold text-primary">
                  ${contract.hourlyRate}
                </p>
                <p className="text-xs text-muted-foreground">per hour</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold">{contract.hours}h</p>
                <p className="text-xs text-muted-foreground">estimated</p>
              </div>
            </div>
            {contract.pricingFactors && (
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {contract.pricingFactors.complexity} project
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {contract.pricingFactors.clientType}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Range: {contract.pricingFactors.rateRange}
                </Badge>
              </div>
            )}
          </div>

          {/* Tool Subscriptions */}
          {contract.toolSubscriptions.length > 0 && (
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              <Wrench className="w-3.5 h-3.5" />
              Tool Subscriptions (billed at cost)
            </p>
            <div className="space-y-2">
              {contract.toolSubscriptions.map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{tool.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    ${tool.cost}/{tool.period}
                  </Badge>
                  {tool.note && (
                    <span className="col-span-full text-xs text-muted-foreground">
                      {tool.note}
                    </span>
                  )}
                </div>
              ))}
              <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
                <span className="font-medium">Monthly tools total</span>
                <span className="font-semibold">
                  ${contract.monthlyToolCost}/mo
                </span>
              </div>
            </div>
          </div>
          )}

          {contract.featureBreakdown && contract.featureBreakdown.length > 0 && (
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                <Clock className="w-3.5 h-3.5" />
                Hour Breakdown
              </p>
              <div className="space-y-2">
                {contract.featureBreakdown.map((item) => (
                  <div key={item.deliverable} className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{item.deliverable}</span>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {item.hours}h
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost Breakdown */}
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              <Calculator className="w-3.5 h-3.5" />
              Cost Breakdown
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Labor ({contract.hours}h × ${contract.hourlyRate})
                </span>
                <span>${contract.laborCost.toLocaleString()}</span>
              </div>
              {contract.totalToolCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tools ({contract.projectDurationMonths} month
                    {contract.projectDurationMonths > 1 ? "s" : ""} × $
                    {contract.monthlyToolCost})
                  </span>
                  <span>${contract.totalToolCost.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-border/50 text-base font-bold">
                <span>Total Project Cost</span>
                <span className="text-primary">
                  ${contract.totalCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              Estimated timeline: {contract.projectDurationMonths} month
              {contract.projectDurationMonths > 1 ? "s" : ""} (~80 hrs/month)
            </span>
          </div>

          {/* Terms */}
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              <CheckCircle className="w-3.5 h-3.5" />
              Terms
            </p>
            <ul className="space-y-1.5">
              {contract.terms.map((term) => (
                <li
                  key={term}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-primary mt-0.5">•</span>
                  {term}
                </li>
              ))}
            </ul>
          </div>

          {/* Delivery status — contract was already emailed server-side */}
          {delivery?.sent && delivery.sentTo && (
            <div className="flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-2.5 text-sm text-green-600 dark:text-green-400">
              <Check className="w-4 h-4 shrink-0" />
              <span>
                PDF emailed to <span className="font-medium">{delivery.sentTo}</span>
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download PDF
            </button>
            {!delivery?.sent && (
              <button
                onClick={handleSend}
                disabled={sending || sent}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full glass text-sm font-medium hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                {sent ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    Sent
                  </>
                ) : sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send to Client
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
