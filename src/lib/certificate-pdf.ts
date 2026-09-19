import { getCertificateTemplate } from "@/lib/certificate-templates";

type CertificatePdfData = { recipient: string; course: string; issuedAt: string; code: string; templateId?: string | null };

function safeFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "certificate";
}

export async function downloadCertificatePdf(data: CertificatePdfData) {
  const { jsPDF } = await import("jspdf");
  const template = getCertificateTemplate(data.templateId);
  const colors = template.pdf;
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const width = 297;
  const height = 210;
  pdf.setFillColor(`#${colors.background}`); pdf.rect(0, 0, width, height, "F");
  pdf.setDrawColor(`#${colors.accent}`); pdf.setLineWidth(1.1); pdf.rect(8, 8, width - 16, height - 16);
  pdf.setDrawColor(`#${colors.soft}`); pdf.setLineWidth(0.35); pdf.rect(11, 11, width - 22, height - 22);

  if (["heritage-curve", "renewal-ribbon", "golden-path"].includes(template.id)) {
    pdf.setFillColor(`#${colors.dark}`); pdf.triangle(0, 0, 88, 0, 0, 34, "F"); pdf.triangle(width, height, width - 88, height, width, height - 34, "F");
    pdf.setDrawColor(`#${colors.accent}`); pdf.setLineWidth(3); pdf.line(3, 37, 42, 12); pdf.line(width - 3, height - 37, width - 42, height - 12);
  } else if (template.id === "modern-column") {
    pdf.setFillColor(`#${colors.dark}`); pdf.rect(0, 0, 30, height, "F");
    pdf.setTextColor(`#${colors.background}`); pdf.setFont("helvetica", "bold"); pdf.setFontSize(18); pdf.text("JK", 15, 26, { align: "center" });
  } else if (template.id === "terracotta-horizon") {
    pdf.setFillColor(`#${colors.soft}`); pdf.circle(width / 2, height + 20, 72, "F");
    pdf.setFillColor(`#${colors.accent}`); pdf.circle(width / 2, height + 22, 52, "F");
  } else if (template.id === "family-circle") {
    pdf.setDrawColor(`#${colors.soft}`); pdf.setLineWidth(5); pdf.circle(24, 24, 27); pdf.circle(width - 24, height - 24, 27);
    pdf.setDrawColor(`#${colors.accent}`); pdf.setLineWidth(2); pdf.circle(27, 27, 19); pdf.circle(width - 27, height - 27, 19);
  } else if (template.id === "editorial-seal") {
    pdf.setFillColor(`#${colors.dark}`); pdf.rect(0, 0, width, 16, "F"); pdf.rect(0, height - 11, width, 11, "F");
  } else if (template.id === "linen-arch") {
    pdf.setDrawColor(`#${colors.soft}`); pdf.setLineWidth(7); pdf.ellipse(width / 2, height + 9, 115, 58);
    pdf.setDrawColor(`#${colors.accent}`); pdf.setLineWidth(2); pdf.ellipse(width / 2, height + 10, 97, 47);
  } else if (template.id === "quiet-laurel") {
    pdf.setDrawColor(`#${colors.accent}`); pdf.setLineWidth(1.2); pdf.ellipse(49, 108, 15, 48); pdf.ellipse(width - 49, 108, 15, 48);
  } else {
    pdf.setFillColor(`#${colors.dark}`); pdf.rect(0, 0, width, 8, "F"); pdf.rect(0, height - 8, width, 8, "F");
  }

  const center = width / 2;
  pdf.setTextColor(`#${colors.ink}`);
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.text("JACKIE KEYA LEARNING HUB", center, 27, { align: "center", charSpace: 1.2 });
  pdf.setFont("times", "bold"); pdf.setFontSize(34); pdf.text("CERTIFICATE", center, 54, { align: "center" });
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.text("OF COMPLETION", center, 64, { align: "center", charSpace: 1.7 });
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.text("PROUDLY PRESENTED TO", center, 82, { align: "center", charSpace: 1 });
  pdf.setFont("times", "italic"); pdf.setFontSize(28); pdf.setTextColor(`#${colors.dark}`); pdf.text(data.recipient, center, 99, { align: "center", maxWidth: 190 });
  pdf.setDrawColor(`#${colors.accent}`); pdf.setLineWidth(0.5); pdf.line(center - 63, 104, center + 63, 104);
  pdf.setTextColor(`#${colors.ink}`); pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.text("For successfully completing", center, 116, { align: "center" });
  pdf.setFont("times", "bold"); pdf.setFontSize(17); pdf.text(data.course, center, 128, { align: "center", maxWidth: 190 });
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(`#${colors.dark}`);
  pdf.text("In recognition of the courage, reflection, and commitment shown throughout this learning journey.", center, 140, { align: "center", maxWidth: 185 });
  const issued = new Date(data.issuedAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  pdf.setDrawColor(`#${colors.ink}`); pdf.setLineWidth(0.35); pdf.line(45, 169, 102, 169); pdf.line(195, 169, 252, 169);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(`#${colors.ink}`); pdf.text(issued, 73.5, 165, { align: "center" });
  pdf.setFont("times", "italic"); pdf.setFontSize(15); pdf.text("Jackie Keya", 223.5, 165, { align: "center" });
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.text("DATE ISSUED", 73.5, 176, { align: "center", charSpace: 1 }); pdf.text("FOUNDER & COACH", 223.5, 176, { align: "center", charSpace: 1 });
  pdf.setFillColor(`#${colors.dark}`); pdf.circle(center, 168, 13, "F"); pdf.setDrawColor(`#${colors.accent}`); pdf.setLineWidth(1.3); pdf.circle(center, 168, 10);
  pdf.setTextColor(`#${colors.background}`); pdf.setFont("times", "bold"); pdf.setFontSize(11); pdf.text("JK", center, 167, { align: "center" }); pdf.setFont("helvetica", "normal"); pdf.setFontSize(5); pdf.text("LEARNING HUB", center, 172, { align: "center", charSpace: 0.5 });
  pdf.save(`${safeFileName(data.course)}-${safeFileName(data.recipient)}.pdf`);
}