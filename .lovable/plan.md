# Jackie Keya Learning Hub — Initial Release Plan

## Goal
Build the first complete release of Jackie Keya Learning Hub: a warm, trustworthy learning platform for emotional healing, fresh starts, and blended families. The main prompt defines scope; bookings, automated expiry jobs, transactional email, advanced Bunny Stream signing, and secure digital-book delivery remain visible placeholders only.

## Visual direction
- Use the supplied palette exactly: Warm Coffee Brown `#6B4B3A`, Roasted Oat `#C5A89A`, Muted Terracotta `#D29C88`, Soft Cream Linen `#F7F4EF`, and Deep Roast `#3A2E2B`.
- Create a soft editorial coaching aesthetic: generous breathing room, restrained rounded corners, tactile linen-like warmth, human photography, refined serif headings, and highly readable sans-serif body text.
- Keep motion subtle: gentle entrances, calm card transitions, accordion expansion, progress animation, and reduced-motion support.
- Avoid clinical, corporate, overly feminine, generic-template, or heavy-LMS styling.
- Build mobile-first and verify phone and desktop layouts.

## Public website
- Shared responsive header and comprehensive footer.
- Home: Jackie-led visual introduction, “Your Journey to Peace Starts Here,” dual calls to action, accurate-looking sample trust indicators clearly treated as starter content, and the six-path “What are you navigating right now?” selector.
- Courses: filterable catalog for Fresh Start and Blended Family tracks, with price, duration, lesson/module counts, audience, and enrollment actions.
- Course details: outcome-led introduction, audience fit, learning outcomes, resources, access period, testimonials, pricing, and expandable curriculum with lesson states.
- Dedicated Blended Families and New Beginnings pages based on the supplied content outlines.
- About Jackie: portrait-led biography structure, credentials, philosophy, expertise, recognition, testimonials, and course call to action. Unknown biographical facts will be clearly marked as content placeholders rather than invented.
- Resources, Blog, FAQ, Contact, and Book-a-Session placeholder pages so every navigation link works; booking remains explicitly unavailable in this release.
- Unique search/social metadata for every page.

## Accounts and student experience
- Enable Lovable Cloud for secure accounts, profile data, course data, enrollments, progress, payments, and certificates.
- Email/password registration, sign-in, sign-out, forgot-password, and reset-password flows; Google and Facebook presented as clearly labeled future placeholders per the brief.
- Store student profiles with display name, avatar, preferences, and account settings; create profiles automatically on registration and restrict each student to their own private records.
- Protected student dashboard with overview, motivational greeting, progress snapshot, continue-learning card, enrolled courses, recently accessed lessons, certificates, payment history, profile, password change, and notification preferences.
- Learning screen with video placeholder/Bunny Stream ID support, module navigation, previous/next controls, resources, resume position, lesson completion, and course progress.
- Certificate records with student name, verification number, issue date, and a download action using an initial printable certificate view.

## Data and access rules
- Create related tables for profiles, courses, modules, lessons, enrollments, lesson progress, payments, and certificates.
- Add constraints for categories, enrollment/payment states, sort order, unique progress rows, unique course enrollments, and certificate numbers.
- Set enrollment expiry to 42 days when access is created; enforce expiry whenever protected course access is checked. Automated daily cleanup remains excluded.
- Apply row-level privacy so public visitors only see published catalog content and students only see or update their own profile, enrollment, progress, purchase, and certificate records.
- Seed representative Fresh Start and Blended Family courses, modules, lessons, enrollment progress, payments, and certificates so the initial experience is populated.

## Checkout simulation
- Mobile-first checkout dialog with course summary, base price, discount, promo-code interaction, final KES total, and M-Pesa/Paystack selection.
- Prevent repeat submissions while processing and create a unique simulated transaction reference.
- Show clear processing, success, and failure states.
- On simulated success, record a successful payment, create the enrollment with 42-day access, and open the student dashboard.
- Clearly label this as a simulation; no real provider charge, webhook, refund, reconciliation, or transactional email is included in this release.

## Technical approach
- Use the project’s existing React/TanStack Start structure, TypeScript, Tailwind CSS, and semantic design tokens. This replaces the requested plain Vite SPA/static HostGator architecture because the active project uses a secure server-capable application stack needed for accounts and private learning data.
- Use separate routes for shareable pages and a protected route group for student-only pages.
- Keep course/public reads server-renderable and authenticated records server-validated.
- Use reusable site, course, dashboard, form, progress, checkout, and certificate components.

## Validation
- Verify registration, sign-in, password recovery, sign-out, protected-route redirects, profile editing, simulated purchase-to-enrollment, lesson completion, progress persistence, expiry checks, and certificate access.
- Check all public navigation, filters, accordions, checkout states, empty/error states, and metadata.
- Visually inspect key pages at mobile and desktop sizes for clipping, overlap, readability, and consistent use of the moodboard direction.

## Deferred placeholders
- Session booking/scheduling
- Automated daily 42-day expiry job
- Bunny Stream signed playback tokens
- Transactional email delivery
- Secure digital-book download engine
- Real M-Pesa/Paystack charging, webhooks, refunds, and reconciliation
- Full admin console, advanced analytics, badges, and notification automation
