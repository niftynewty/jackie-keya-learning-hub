# Detailed Admin Workspace Rebuild

## Goal
Rebuild Jackie’s admin area as the selected **Executive workspace**: a warm, highly detailed operations center that matches the uploaded specification while preserving every working management action. Real payment collection and M-Pesa remain excluded.

## What will change

### 1. Admin shell and navigation
- Replace horizontal tabs with a responsive, collapsible coffee-brown sidebar and compact top bar.
- Group navigation into Dashboard, Learning, People, Sales, Content, Bookings, Analytics, and Settings.
- Keep the public website header/footer out of the admin workspace so the admin fills the screen.
- Add global search, clear active states, mobile navigation, admin identity, notifications, and links back to the student/public views.

### 2. Detailed dashboard overview
- Add live cards for total and active students, courses, enrollments, completions, all-time and monthly revenue, pending payments, and upcoming bookings.
- Add recent activity, recent enrollments, top courses, completion insights, upcoming sessions, quick actions, and student broadcast messaging.
- Derive every displayed value from actual platform records; do not show invented metrics.

### 3. Learning management
- Rework Courses into a searchable list and a detailed editor with overview, pricing, publishing, media-link, access, and SEO sections.
- Present modules and lessons as a nested curriculum builder with ordering controls and safe editing that preserves existing progress.
- Add lesson detail fields for written content, preview/required settings, video, resources, duration, and access rules.
- Add Categories, Resources, Discounts, and Badges management with create/edit/publish controls.

### 4. People, sales, and certificates
- Add searchable/filterable Students and Enrollments views.
- Add a detailed student profile drawer showing account, learning, purchases, sessions, certificates, and activity.
- Keep manual enroll, revoke, and extend-access controls; add complimentary-access support.
- Expand Orders and Payments with summaries, status filters, transaction details, and manual reconciliation only.
- Expand Certificates with search, issue, revoke/reissue state, download link, certificate ID, and verification details.

### 5. Content, bookings, analytics, and settings
- Add Articles and Testimonials management, including draft/published/featured states.
- Expand Sessions and Calendar views with upcoming/completed/cancelled/no-show filters and rescheduling status.
- Add analytics for student growth, course enrollment/completion, revenue by course, and booking performance using available data.
- Add role-aware admin accounts, an admin activity log, and editable platform settings for public contact/social/certificate details.
- Keep email automation and payment-provider settings as clearly labeled future placeholders, not fake working integrations.

## Technical details
- Extend Lovable Cloud with narrowly scoped tables/fields for resources, coupons, badges, articles, testimonials, activity logs, platform settings, and richer course/lesson status metadata.
- Every new table will use row-level protection and explicit admin-only write access; public reads will be granted only for published content that belongs on the public site.
- Store roles only in the existing dedicated role table. Add staff role values and enforce permissions in data rules, not browser storage.
- Build focused admin components around the existing data hook and existing working controls.
- Fix the current sign-in hydration mismatch while keeping authentication behavior unchanged.

## Validation
- Check the full admin flow using an authenticated admin session.
- Verify desktop and mobile layouts, sidebar collapse/reopen behavior, search/filter states, and all existing create/edit/status actions.
- Verify no browser errors, run focused type/tests through the project harness, and confirm public/student pages remain unchanged.

## Out of scope
- Real M-Pesa or Paystack charging, refunds, automated transactional email, advanced video security, and automated expiry jobs.
