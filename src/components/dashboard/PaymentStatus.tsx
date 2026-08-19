"use client";

import { motion } from "framer-motion";
import { DollarSign, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PaymentStatusProps {
  totalCost: number;
  /** Received to date. Falls back to a half-split for projects billed that way. */
  amountPaid?: number;
  /** Outstanding on the most recent invoice. Defaults to whatever is unpaid. */
  balanceDue?: number;
  downpaymentPaid: boolean;
  finalPaymentPaid: boolean;
}

/** Whole amounts read cleanly; part-amounts need their cents. */
function money(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function PaymentStatus({
  totalCost,
  amountPaid,
  balanceDue,
  downpaymentPaid,
  finalPaymentPaid,
}: PaymentStatusProps) {
  const paid = amountPaid ?? (downpaymentPaid ? totalCost * 0.5 : 0);
  const balance = balanceDue ?? Math.max(totalCost - paid, 0);
  const settled = balance <= 0 || finalPaymentPaid;

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <DollarSign className="w-3.5 h-3.5" />
        Payment Status
      </p>

      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 border bg-green-500/10 border-green-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Paid</span>
          </div>
          <p className="text-2xl font-bold">${money(paid)}</p>
          <Badge variant="secondary" className="mt-2 text-xs bg-green-500/15 text-green-500">
            Received
          </Badge>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-xl p-4 border ${
            settled
              ? "bg-green-500/10 border-green-500/20"
              : "bg-blue-500/10 border-blue-500/20"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {settled ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Clock className="w-4 h-4 text-blue-500" />
            )}
            <span className="text-sm font-medium">Balance from the last invoice</span>
          </div>
          <p className="text-2xl font-bold">${money(balance)}</p>
          <Badge
            variant="secondary"
            className={`mt-2 text-xs ${
              settled
                ? "bg-green-500/15 text-green-500"
                : "bg-blue-500/15 text-blue-500"
            }`}
          >
            {settled ? "Settled" : "Outstanding"}
          </Badge>
        </motion.div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <span className="text-sm text-muted-foreground">Total Project Cost</span>
        <span className="text-xl font-bold text-primary">${money(totalCost)}</span>
      </div>
    </div>
  );
}
