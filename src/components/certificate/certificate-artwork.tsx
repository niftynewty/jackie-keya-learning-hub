import { getCertificateTemplate, type CertificateTemplate } from "@/lib/certificate-templates";
import { cn } from "@/lib/utils";

export type CertificateArtworkProps = {
  recipient: string;
  course: string;
  issuedAt: string;
  code: string;
  templateId?: string | null;
  status?: string;
  compact?: boolean;
  className?: string;
};

const formatDate = (value: string) => new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

function Motif({ motif }: { motif: CertificateTemplate["motif"] }) {
  if (motif === "curves") return <><span className="cert-sweep cert-sweep-top"/><span className="cert-sweep cert-sweep-bottom"/><span className="cert-slash"/></>;
  if (motif === "arch") return <><span className="cert-arch cert-arch-one"/><span className="cert-arch cert-arch-two"/></>;
  if (motif === "horizon") return <><span className="cert-sun"/><span className="cert-horizon cert-horizon-one"/><span className="cert-horizon cert-horizon-two"/></>;
  if (motif === "laurel") return <><span className="cert-laurel cert-laurel-left">❬</span><span className="cert-laurel cert-laurel-right">❭</span></>;
  if (motif === "frame") return <><span className="cert-inner-frame"/><span className="cert-corner cert-corner-a"/><span className="cert-corner cert-corner-b"/></>;
  if (motif === "ribbon") return <><span className="cert-ribbon cert-ribbon-one"/><span className="cert-ribbon cert-ribbon-two"/></>;
  if (motif === "circles") return <><span className="cert-circle cert-circle-one"/><span className="cert-circle cert-circle-two"/><span className="cert-circle cert-circle-three"/></>;
  if (motif === "seal") return <><span className="cert-editorial-block"/><span className="cert-editorial-rule"/></>;
  if (motif === "path") return <><span className="cert-path cert-path-one"/><span className="cert-path cert-path-two"/><span className="cert-path cert-path-three"/></>;
  return <><span className="cert-column"/><span className="cert-column-mark">JK</span></>;
}

export function CertificateArtwork({ recipient, course, issuedAt, code, templateId, status = "valid", compact, className }: CertificateArtworkProps) {
  const template = getCertificateTemplate(templateId);
  return (
    <div className={cn("certificate-shell", compact && "certificate-compact", template.theme, status === "revoked" && "certificate-revoked", className)}>
      <Motif motif={template.motif}/>
      <div className="certificate-content">
        <p className="certificate-brand">Jackie Keya Learning Hub</p>
        <p className="certificate-kicker">Certificate of completion</p>
        <h2 className="certificate-title">Certificate</h2>
        <p className="certificate-presented">Proudly presented to</p>
        <p className="certificate-recipient">{recipient || "Student Name"}</p>
        <div className="certificate-rule"/>
        <p className="certificate-copy">For successfully completing</p>
        <p className="certificate-course">{course || "Course title"}</p>
        <p className="certificate-message">In recognition of the courage, reflection, and commitment shown throughout this learning journey.</p>
        <div className="certificate-footer">
          <div><span>{formatDate(issuedAt)}</span><small>Date issued</small></div>
          <div className="certificate-medallion"><b>JK</b><small>LH</small></div>
          <div><span className="certificate-signature">Jackie Keya</span><small>Founder &amp; Coach</small></div>
        </div>
      </div>
      {status === "revoked" && <div className="certificate-revoked-stamp">Revoked</div>}
    </div>
  );
}