export const CERTIFICATE_TEMPLATE_IDS = [
  "heritage-curve",
  "linen-arch",
  "terracotta-horizon",
  "quiet-laurel",
  "coffee-frame",
  "renewal-ribbon",
  "family-circle",
  "editorial-seal",
  "golden-path",
  "modern-column",
] as const;

export type CertificateTemplateId = (typeof CERTIFICATE_TEMPLATE_IDS)[number];

export type CertificateTemplate = {
  id: CertificateTemplateId;
  name: string;
  description: string;
  theme: string;
  motif:
    | "curves"
    | "arch"
    | "horizon"
    | "laurel"
    | "frame"
    | "ribbon"
    | "circles"
    | "seal"
    | "path"
    | "column";
  pdf: { background: string; ink: string; accent: string; soft: string; dark: string };
};

export const certificateTemplates: CertificateTemplate[] = [
  {
    id: "heritage-curve",
    name: "Heritage Curve",
    description: "Formal sweeping bands and a gold seal.",
    theme: "certificate-heritage",
    motif: "curves",
    pdf: { background: "FDFCF9", ink: "2F2926", accent: "C89A3C", soft: "DDD8D1", dark: "1E2024" },
  },
  {
    id: "linen-arch",
    name: "Linen Arch",
    description: "Quiet arches on warm linen.",
    theme: "certificate-linen",
    motif: "arch",
    pdf: { background: "F7F1E8", ink: "49362D", accent: "B78970", soft: "DFD1C2", dark: "5E463A" },
  },
  {
    id: "terracotta-horizon",
    name: "Terracotta Horizon",
    description: "A grounded horizon for fresh starts.",
    theme: "certificate-terracotta",
    motif: "horizon",
    pdf: { background: "FBF7F1", ink: "3C302D", accent: "C8795D", soft: "E9C6B8", dark: "69473A" },
  },
  {
    id: "quiet-laurel",
    name: "Quiet Laurel",
    description: "A classic award with restrained laurels.",
    theme: "certificate-laurel",
    motif: "laurel",
    pdf: { background: "FAFAF5", ink: "30352F", accent: "8C9168", soft: "D9DDCB", dark: "465044" },
  },
  {
    id: "coffee-frame",
    name: "Coffee Frame",
    description: "A strong double frame in signature coffee.",
    theme: "certificate-coffee",
    motif: "frame",
    pdf: { background: "FFFDF8", ink: "382A25", accent: "A97C66", soft: "E7D8CD", dark: "5C4034" },
  },
  {
    id: "renewal-ribbon",
    name: "Renewal Ribbon",
    description: "Soft ribbons expressing forward movement.",
    theme: "certificate-renewal",
    motif: "ribbon",
    pdf: { background: "F8F5EE", ink: "3D3330", accent: "D08F7C", soft: "E7C9B8", dark: "6B4B3A" },
  },
  {
    id: "family-circle",
    name: "Family Circle",
    description: "Interlocking circles for belonging and harmony.",
    theme: "certificate-family",
    motif: "circles",
    pdf: { background: "FCFAF5", ink: "35302D", accent: "B68068", soft: "D7B9A9", dark: "5A4439" },
  },
  {
    id: "editorial-seal",
    name: "Editorial Seal",
    description: "Minimal editorial typography and a bold seal.",
    theme: "certificate-editorial",
    motif: "seal",
    pdf: { background: "F5F3EE", ink: "242322", accent: "B88B52", soft: "D8D4CC", dark: "242322" },
  },
  {
    id: "golden-path",
    name: "Golden Path",
    description: "Fine golden lines marking a milestone.",
    theme: "certificate-golden",
    motif: "path",
    pdf: { background: "FFFCF5", ink: "3B302A", accent: "C79C45", soft: "E8D9B8", dark: "604B3E" },
  },
  {
    id: "modern-column",
    name: "Modern Column",
    description: "A crisp contemporary side-column layout.",
    theme: "certificate-modern",
    motif: "column",
    pdf: { background: "FAF8F3", ink: "302C2A", accent: "C28169", soft: "E5D7CC", dark: "523B32" },
  },
];

export const DEFAULT_CERTIFICATE_TEMPLATE: CertificateTemplateId = "heritage-curve";

export function isCertificateTemplateId(
  value: string | null | undefined,
): value is CertificateTemplateId {
  return CERTIFICATE_TEMPLATE_IDS.includes(value as CertificateTemplateId);
}

export function getCertificateTemplate(value: string | null | undefined): CertificateTemplate {
  return certificateTemplates.find((template) => template.id === value) ?? certificateTemplates[0]!;
}
