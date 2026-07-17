import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type FeedbackItem = { type: "good" | "warn"; title: string; detail: string };

interface SessionData {
  job_title: string;
  interview_type?: string;
  overall_score: number;
  clarity_rating: number;
  filler_count: number;
  filler_breakdown: Record<string, number>;
  feedback: FeedbackItem[];
  duration_seconds: number;
  created_at: string;
}

interface ExportOptions {
  session: SessionData;
  allSessions?: SessionData[];
  interviewTypeLabel: string;
}

export function generateDetailedPDF({ session, allSessions, interviewTypeLabel }: ExportOptions): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("VibeCoach Performance Report", pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("AI Interview Coaching — Detailed Session Analysis", pageWidth / 2, y, { align: "center" });
  y += 12;

  // Divider
  doc.setDrawColor(200);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  // Session info
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Session Overview", 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const sessionDate = new Date(session.created_at).toLocaleString();
  const duration = `${Math.floor(session.duration_seconds / 60)}m ${session.duration_seconds % 60}s`;

  const infoLines = [
    `Job Title: ${session.job_title}`,
    `Interview Type: ${interviewTypeLabel}`,
    `Date: ${sessionDate}`,
    `Duration: ${duration}`,
  ];
  infoLines.forEach((line) => {
    doc.text(line, 14, y);
    y += 6;
  });
  y += 6;

  // Score summary table
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Performance Metrics", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Score", "Rating"]],
    body: [
      ["Overall Score", `${session.overall_score}/100`, getScoreRating(session.overall_score)],
      ["Clarity Rating", `${session.clarity_rating.toFixed(1)}/10`, getClarityRating(session.clarity_rating)],
      ["Filler Words", `${session.filler_count} total`, getFillerRating(session.filler_count)],
      ["Duration", duration, "—"],
    ],
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 4 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // Filler word breakdown
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Filler Word Breakdown", 14, y);
  y += 4;

  const fillerEntries = Object.entries(session.filler_breakdown);
  autoTable(doc, {
    startY: y,
    head: [["Filler Word", "Count", "% of Total"]],
    body: fillerEntries.map(([word, count]) => [
      `"${word}"`,
      String(count),
      session.filler_count > 0 ? `${Math.round((count / session.filler_count) * 100)}%` : "0%",
    ]),
    theme: "grid",
    headStyles: { fillColor: [220, 38, 38], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 4 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // Check if we need a new page
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  // Feedback section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Detailed Feedback", 14, y);
  y += 4;

  const feedbackBody = session.feedback.map((item) => [
    item.type === "good" ? "Strength" : "Improve",
    item.title,
    item.detail,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Type", "Area", "Detail"]],
    body: feedbackBody,
    theme: "grid",
    headStyles: { fillColor: [16, 185, 129], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 40 },
      2: { cellWidth: "auto" },
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        if (data.cell.raw === "Improve") {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = "bold";
        } else {
          data.cell.styles.textColor = [16, 185, 129];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // Progress over time (if multiple sessions)
  if (allSessions && allSessions.length > 1) {
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Progress Over Time", 14, y);
    y += 4;

    const avg = Math.round(allSessions.reduce((a, s) => a + s.overall_score, 0) / allSessions.length);
    const best = Math.max(...allSessions.map((s) => s.overall_score));
    const worst = Math.min(...allSessions.map((s) => s.overall_score));

    autoTable(doc, {
      startY: y,
      head: [["Statistic", "Value"]],
      body: [
        ["Total Sessions", String(allSessions.length)],
        ["Average Score", `${avg}/100`],
        ["Best Score", `${best}/100`],
        ["Lowest Score", `${worst}/100`],
        ["Improvement (First → Latest)", `${allSessions[0].overall_score - allSessions[allSessions.length - 1].overall_score > 0 ? "+" : ""}${allSessions[0].overall_score - allSessions[allSessions.length - 1].overall_score} pts`],
      ],
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 4 },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // Session history table
    if (y > 200) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Session History", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["#", "Date", "Job Title", "Type", "Score", "Clarity", "Fillers"]],
      body: [...allSessions].reverse().map((s, i) => [
        String(i + 1),
        new Date(s.created_at).toLocaleDateString(),
        s.job_title.length > 25 ? s.job_title.slice(0, 25) + "…" : s.job_title,
        s.interview_type ?? "mixed",
        `${s.overall_score}`,
        s.clarity_rating.toFixed(1),
        String(s.filler_count),
      ]),
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Generated by VibeCoach AI · Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" },
    );
  }

  return doc;
}

export function downloadSessionPDF(options: ExportOptions) {
  const doc = generateDetailedPDF(options);
  const filename = `vibecoach-report-${options.session.job_title.replace(/\s+/g, "-").toLowerCase()}-${new Date(options.session.created_at).toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

function getScoreRating(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  return "Needs Work";
}

function getClarityRating(rating: number): string {
  if (rating >= 9) return "Crystal Clear";
  if (rating >= 7.5) return "Very Clear";
  if (rating >= 6) return "Clear";
  if (rating >= 4) return "Moderate";
  return "Needs Work";
}

function getFillerRating(count: number): string {
  if (count <= 3) return "Excellent";
  if (count <= 6) return "Good";
  if (count <= 10) return "Fair";
  return "Needs Improvement";
}
