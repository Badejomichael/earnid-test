"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Circle,
  Line,
} from "@react-pdf/renderer";

const G = "#C8F135";
const BG = "#080808";
const CARD = "#111111";
const CARD2 = "#0d0d0d";
const WHITE = "#ffffff";
const MUTED = "#555555";
const DIM = "#333333";
const DIMMER = "#1e1e1e";
const DIMMEST = "#161616";
const MONO = "#3a3a3a";
const MONO2 = "#2a2a2a";
const BORDER = "#1f1f1f";
const DARKBORDER = "#141414";

const s = StyleSheet.create({
  page: {
    backgroundColor: BG,
    padding: 16,
    fontFamily: "Helvetica",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: "16 22 14 22",
    width: "100%",
    border: `1 solid ${BORDER}`,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoDot: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: G,
    alignItems: "center", justifyContent: "center",
    marginRight: 5,
  },
  logoE: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#000" },
  logoText: { fontSize: 10, fontFamily: "Helvetica-Bold", color: WHITE },
  badge: {
    border: `0.8 solid rgba(200,241,53,0.35)`,
    borderRadius: 20,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  badgeText: { fontSize: 6, fontFamily: "Courier", color: G, letterSpacing: 1.5 },

  divider: { height: 0.8, backgroundColor: DIMMEST, marginBottom: 8 },

  credLabel: { fontSize: 6, color: DIMMER, letterSpacing: 2, marginBottom: 2 },
  name: { fontSize: 18, fontFamily: "Helvetica-Bold", color: WHITE, marginBottom: 1 },
  profession: { fontSize: 8, color: MUTED, marginBottom: 8 },

  // Main row
  mainRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },

  // Score box (replacing ring - cleaner in PDF)
  scoreBox: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: CARD2,
    border: `1 solid #1a1a1a`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
    flexShrink: 0,
  },
  scoreNum: { fontSize: 28, fontFamily: "Helvetica-Bold", color: G, lineHeight: 1 },
  scoreLabel: { fontSize: 6, color: DIM, letterSpacing: 1.5, marginTop: 2 },

  statsRow: { flexDirection: "row", gap: 16, flex: 1 },
  statBlock: { flexDirection: "column" },
  statLbl: { fontSize: 6, color: DIM, letterSpacing: 1.8, marginBottom: 2 },
  statVal: { fontSize: 16, fontFamily: "Helvetica-Bold", color: WHITE },
  statSub: { fontSize: 10, color: "#666666" },

  breakdown: {
    backgroundColor: CARD2,
    borderRadius: 6,
    padding: "7 9",
    marginBottom: 8,
    border: `0.8 solid ${DARKBORDER}`,
  },
  breakTitle: { fontSize: 6, color: DIM, letterSpacing: 1.8, marginBottom: 5 },
  barRow: { marginBottom: 4 },
  barHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  barLbl: { fontSize: 7, color: MUTED },
  barVal: { fontSize: 7, fontFamily: "Courier", color: G },
  barBg: { height: 2, backgroundColor: "#111111", borderRadius: 2 },
  barFill: { height: 2, backgroundColor: G, borderRadius: 2 },

  sourcesRow: { flexDirection: "row", gap: 5, flexWrap: "wrap", marginBottom: 8 },
  sourceTag: {
    border: `0.8 solid #252525`,
    borderRadius: 20,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  sourceText: { fontSize: 7, fontFamily: "Courier", color: MUTED },

  footerDivider: { height: 0.8, backgroundColor: DIMMEST, marginBottom: 8 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  chainLbl: { fontSize: 5.5, color: DIMMER, letterSpacing: 2, marginBottom: 2 },
  chainVal: { fontSize: 7.5, fontFamily: "Courier", color: MONO, marginBottom: 1 },
  verifyUrl: { fontSize: 6.5, fontFamily: "Courier", color: MONO2 },
  metaRight: { alignItems: "flex-end" },
});

interface Props {
  credential: {
    id: string;
    total_earned: number;
    consistency_score: number;
    active_since: string;
    monthly_average: number;
    top_sources: string[];
    mint_address: string | null;
    created_at: string;
  };
  profile: { full_name: string; profession: string };
  verifyUrl: string;
  breakdown: { volume: number; regularity: number; diversity: number };
}

export function CredentialPDF({ credential, profile, verifyUrl, breakdown }: Props) {
  const score = credential.consistency_score;
  const mintAddr = credential.mint_address
    ? `${credential.mint_address.slice(0, 16)}...${credential.mint_address.slice(-8)}`
    : "Solana Devnet";
  const minted = new Date(credential.created_at).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const since = new Date(credential.active_since).toLocaleDateString("en-US", {
    month: "short", year: "numeric",
  });

  return (
    <Document>
      <Page size={[595, 380]} style={s.page}>
        <View style={s.card}>

          {/* Header */}
          <View style={s.headerRow}>
            <View style={s.logoRow}>
              <View style={s.logoDot}>
                <Text style={s.logoE}>E</Text>
              </View>
              <Text style={s.logoText}>EarnID</Text>
            </View>
            <View style={s.badge}>
              <Text style={s.badgeText}>VERIFIED</Text>
            </View>
          </View>

          <View style={s.divider} />

          {/* Name */}
          <Text style={s.credLabel}>INCOME CREDENTIAL</Text>
          <Text style={s.name}>{profile.full_name}</Text>
          <Text style={s.profession}>{profile.profession} · Nigeria</Text>

          {/* Score + Stats */}
          <View style={s.mainRow}>
            {/* Score box */}
            <View style={s.scoreBox}>
              <Text style={s.scoreNum}>{score}</Text>
              <Text style={s.scoreLabel}>SCORE</Text>
            </View>

            {/* Stats */}
            <View style={s.statsRow}>
              <View style={s.statBlock}>
                <Text style={s.statLbl}>TOTAL VERIFIED</Text>
                <Text style={s.statVal}>${credential.total_earned.toLocaleString()}</Text>
              </View>
              <View style={s.statBlock}>
                <Text style={s.statLbl}>AVG / MONTH</Text>
                <Text style={s.statSub}>${Math.round(credential.monthly_average).toLocaleString()}</Text>
              </View>
              <View style={s.statBlock}>
                <Text style={s.statLbl}>ACTIVE SINCE</Text>
                <Text style={s.statSub}>{since}</Text>
              </View>
            </View>
          </View>

          {/* Score Breakdown */}
          <View style={s.breakdown}>
            <Text style={s.breakTitle}>SCORE BREAKDOWN</Text>
            {[
              { label: "Volume · 40%", val: breakdown.volume },
              { label: "Regularity · 40%", val: breakdown.regularity },
              { label: "Diversity · 20%", val: breakdown.diversity },
            ].map((b) => (
              <View key={b.label} style={s.barRow}>
                <View style={s.barHeader}>
                  <Text style={s.barLbl}>{b.label}</Text>
                  <Text style={s.barVal}>{b.val}</Text>
                </View>
                <View style={s.barBg}>
                  <View style={[s.barFill, { width: `${b.val}%` as any }]} />
                </View>
              </View>
            ))}
          </View>

          {/* Sources */}
          <View style={s.sourcesRow}>
            {credential.top_sources.map((src) => (
              <View key={src} style={s.sourceTag}>
                <Text style={s.sourceText}>{src}</Text>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={s.footerDivider} />
          <View style={s.footerRow}>
            <View>
              <Text style={s.chainLbl}>ON-CHAIN PROOF</Text>
              <Text style={s.chainVal}>SOL · {mintAddr}</Text>
              <Text style={s.verifyUrl}>{verifyUrl}</Text>
            </View>
            <View style={s.metaRight}>
              <Text style={s.chainLbl}>MINTED</Text>
              <Text style={s.chainVal}>{minted}</Text>
              <Text style={s.verifyUrl}>Solana Devnet</Text>
            </View>
          </View>

        </View>
      </Page>
    </Document>
  );
}