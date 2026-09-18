# Certificate Studio and Reusable Templates

## Goal
Replace the basic certificate record cards with a polished certificate system inspired by the uploaded reference: formal landscape awards, clear recipient hierarchy, restrained curved accents, signature/seal details, and real student downloads. Add ten reusable designs Jackie can assign to courses now or when creating new courses later.

## What will change

### 1. Ten certificate templates
- Create ten distinct, branded landscape templates using the existing warm coffee, oat, terracotta, cream, charcoal, and gold language.
- Keep the reference’s formal structure while making every design original to Jackie Keya Learning Hub.
- Each template will include the hub name, certificate title, recipient name, completed course, issue date, verification code, Jackie’s signature area, and a verification/seal treatment.
- Build templates as responsive reusable certificate artwork, with stable print dimensions and clean mobile previews.

### 2. Course-level template selection
- Add a certificate-template field to each course, with a sensible default for existing courses.
- Add a visual template gallery to the course editor so Jackie can preview and choose one while creating or editing a course.
- Preserve the chosen design on each issued certificate, so changing a course later does not unexpectedly restyle certificates already awarded.

### 3. Certificate issuing and management
- Upgrade the existing issue form with a large live preview of the chosen course template.
- Continue supporting searchable student selection, course selection, editable unique code, recipient name, and issue date.
- Save the selected template with the certificate record.
- Add clear preview, download, revoke/restore, and reissue actions to issued certificate records.

### 4. Student certificate experience
- Replace the simple certificate cards in the dashboard and detailed profile with polished previews.
- Add a dedicated certificate view that displays the full award and validates that the signed-in student owns it.
- Generate a high-quality landscape PDF in the browser for immediate download, with the recipient, course, date, and code rendered into the selected design.
- Show revoked certificates clearly and prevent downloading them as valid awards.

### 5. Data and access protection
- Extend certificate and course records only with the fields needed for template assignment and snapshotting.
- Keep certificate access private to the student and administrators under the existing protected rules.
- Retain current auto-issue behavior on course completion, but make it use the course’s assigned template.

## Technical details
- Add `certificate_template` to courses and `template_id` to certificates through a Lovable Cloud migration.
- Store template definitions in one typed client-safe registry so the admin preview, student view, and PDF export always match.
- Use a client-side PDF export path so downloads contain live certificate data without storing generated files or requiring external services.
- Keep the uploaded image as visual reference only; it will not be embedded or copied.

## Validation
- Verify all ten templates at landscape print size and in desktop/mobile previews.
- Issue a test certificate, confirm it appears for the correct student, preview it, download its PDF, and verify its text and layout.
- Confirm course template selection persists and new course-completion certificates inherit it.
- Confirm revoked certificates cannot be downloaded as valid awards.
- Check the admin course editor, certificate section, student dashboard, and profile for regressions and browser errors.

## Out of scope
- Physical printing/fulfillment, email delivery, third-party accreditation, and cryptographic certificate signing.
