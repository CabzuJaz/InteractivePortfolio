"use client";

import { motion } from "framer-motion";
import { DollarSign, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PaymentStatusProps {
  totalCost: number;
  downpaymentPaid: boolean;
  finalPaymentPaid: boolean;
}

export function PaymentStatus({
  totalCost,
  downpaymentPaid,
  finalPaymentPaid,
}: PaymentStatusProps) {
  const downpaymentAmount = totalCost * 0.5;
  const finalAmount = totalCost * 0.5;

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <DollarSign className="w-3.5 h-3.5" />
        Payment Status
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Downpayment */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-4 border ${
            downpaymentPaid
              ? "bg-green-500/10 border-green-500/20"
              : "bg-yellow-500/10 border-yellow-500/20"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {downpaymentPaid ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Clock className="w-4 h-4 text-yellow-500" />
            )}
            <span className="text-sm font-medium">Downpayment</span>
          </div>
          <p className="text-2xl font-bold">${downpaymentAmount.toLocaleString()}</p>
          <Badge
            variant="secondary"
            className={`mt-2 text-xs ${
              downpaymentPaid
                ? "bg-green-500/15 text-green-500"
                : "bg-yellow-500/15 text-yellow-500"
            }`}
          >
            {downpaymentPaid ? "Paid" : "Pending"}
          </Badge>
        </motion.div>

        {/* Final Payment */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-xl p-4 border ${
            finalPaymentPaid
              ? "bg-green-500/10 border-green-500/20"
              : downpaymentPaid
              ? "bg-blue-500/10 border-blue-500/20"
              : "bg-muted/30 border-border/50"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {finalPaymentPaid ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Clock
                className={`w-4 h-4 ${
                  downpaymentPaid ? "text-blue-500" : "text-muted-foreground"
                }`}
              />
            )}
            <span className="text-sm font-medium">Final Payment</span>
          </div>
          <p className="text-2xl font-bold">${finalAmount.toLocaleString()}</p>
          <Badge
            variant="secondary"
            className={`mt-2 text-xs ${
              finalPaymentPaid
                ? "bg-green-500/15 text-green-500"
                : downpaymentPaid
                ? "bg-blue-500/15 text-blue-500"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {finalPaymentPaid ? "Paid" : downpaymentPaid ? "Due on delivery" : "Waiting"}
          </Badge>
        </motion.div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <span className="text-sm text-muted-foreground">Total Project Cost</span>
        <span className="text-xl font-bold text-primary">
          ${totalCost.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
