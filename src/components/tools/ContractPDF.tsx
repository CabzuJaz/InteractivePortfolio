"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

// Colors
const CYAN = "#06b6d4";
const DARK = "#1a1a2e";
const MUTED = "#6b7280";
const LIGHT_BG = "#f8fafc";
const BORDER = "#e2e8f0";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: DARK,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: CYAN,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: CYAN,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: MUTED,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  date: {
    fontSize: 9,
    color: MUTED,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: CYAN,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  label: {
    color: MUTED,
    fontSize: 10,
  },
  value: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  bigValue: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: CYAN,
  },
  grid: {
    flexDirection: "row",
    gap: 20,
  },
  gridItem: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  gridLabel: {
    fontSize: 9,
    color: MUTED,
    marginTop: 4,
  },
  termItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  bullet: {
    color: CYAN,
    marginRight: 8,
    fontFamily: "Helvetica-Bold",
  },
  termText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
  },
  toolRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  toolName: {
    color: MUTED,
    fontSize: 10,
  },
  toolCost: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 2,
    borderTopColor: CYAN,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  totalValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: CYAN,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: MUTED,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 10,
  },
  projectDesc: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 16,
    color: DARK,
  },
});

interface ContractData {
  clientName: string;
  clientEmail?: string | null;
  projectDescription: string;
  hourlyRate: number;
  hours: number;
  laborCost: number;
  toolSubscriptions: { name: string; cost: number; period: string }[];
  monthlyToolCost: number;
  projectDurationMonths: number;
  totalToolCost: number;
  totalCost: number;
  pricingFactors?: {
    complexity: string;
    clientType: string;
    rateRange: string;
    selectedRate: string;
  };
  terms: string[];
}

export function ContractPDFDocument({ contract }: { contract: ContractData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Contract Proposal</Text>
            <Text style={styles.subtitle}>
              Prepared for {contract.clientName}
            </Text>
            {contract.clientEmail && (
              <Text style={styles.subtitle}>{contract.clientEmail}</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
            {contract.pricingFactors && (
              <Text style={styles.subtitle}>
                {contract.pricingFactors.selectedRate} ({contract.pricingFactors.complexity})
              </Text>
            )}
          </View>
        </View>

        {/* Project Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Scope</Text>
          <Text style={styles.projectDesc}>{contract.projectDescription}</Text>
        </View>

        {/* Rate Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate Card</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.bigValue}>${contract.hourlyRate}</Text>
              <Text style={styles.gridLabel}>per hour</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bigValue}>{contract.hours}h</Text>
              <Text style={styles.gridLabel}>estimated</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bigValue}>
                {contract.projectDurationMonths}mo
              </Text>
              <Text style={styles.gridLabel}>duration</Text>
            </View>
          </View>
        </View>

        {/* Tool Subscriptions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Tool Subscriptions (billed at cost)
          </Text>
          {contract.toolSubscriptions.map((tool) => (
            <View key={tool.name} style={styles.toolRow}>
              <Text style={styles.toolName}>{tool.name}</Text>
              <Text style={styles.toolCost}>
                ${tool.cost}/{tool.period}
              </Text>
            </View>
          ))}
          <View style={[styles.toolRow, { marginTop: 8 }]}>
            <Text style={[styles.toolName, { fontFamily: "Helvetica-Bold" }]}>
              Monthly tools total
            </Text>
            <Text style={styles.toolCost}>${contract.monthlyToolCost}/mo</Text>
          </View>
        </View>

        {/* Cost Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cost Breakdown</Text>
          <View style={styles.row}>
            <Text style={styles.label}>
              Labor ({contract.hours}h × ${contract.hourlyRate})
            </Text>
            <Text style={styles.value}>
              ${contract.laborCost.toLocaleString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>
              Tools ({contract.projectDurationMonths} month
              {contract.projectDurationMonths > 1 ? "s" : ""} × $
              {contract.monthlyToolCost})
            </Text>
            <Text style={styles.value}>
              ${contract.totalToolCost.toLocaleString()}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Project Cost</Text>
            <Text style={styles.totalValue}>
              ${contract.totalCost.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          {contract.terms.map((term, i) => (
            <View key={i} style={styles.termItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.termText}>{term}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Jazzmin Sicat-Cabizares · AI Automation Engineer ·
          jazzmincabizares@gmail.com · BuildWithJazz.com
        </Text>
      </Page>
    </Document>
  );
}

/**
 * Generates a PDF blob for the contract.
 */
export async function generateContractPDF(contract: ContractData): Promise<Blob> {
  return pdf(<ContractPDFDocument contract={contract} />).toBlob();
}
