# jackie keya learning hub

here is a prompt for the website i want to build
furthermore i will upload 10 moodboards,,,,,analyze then in details and reply with ok so i can upload the last mood board
1. Project Overview & Brand Vibe

Build a full-stack, responsive web application for the Jackie Keya Learning Hub, a digital coaching platform focused on emotional healing, fresh starts, and harmonious blended families.

Tagline: Healing Fresh Starts & Harmonious Blended Families

Design Philosophy: The interface must feel soft, safe, warm, professional, human, premium, and hopeful.

Strict Anti-Goals: Avoid anything that feels corporate, clinical, cold, overly feminine, like a generic WordPress template, or like a heavy university LMS.

Color Palette (Tailwind / CSS Variables):

Primary Brand (Warm Coffee Brown): #6B4B3A

Secondary Accent (Roasted Oat): #C5A89A

Warm Pop (Muted Terracotta): #D29C88

Canvas Background (Soft Cream Linen): #F7F4EF

Body Text (Deep Roast): #3A2E2B

2. Tech Stack & Architecture

Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion for smooth, subtle transitions.

Backend & Database: Supabase (Authentication, PostgreSQL Database, Row Level Security).

Target Deployment: Static export compatible with Vite, designed for standard shared hosting via SPA routing (.htaccess).

3. Core Pages & UI Layouts

Implement the following pages with fully responsive layouts (mobile-first navigation, stacked cards, clean typography):

Home Page:

Hero Section: Headline "Your Journey to Peace Starts Here." Supporting copy about life transitions and renewal. Professional imagery/introductory video placeholder of Jackie. CTAs: "Explore Courses" and "Work With Jackie". Trust indicators (years of experience, student counts).

"What Brings You Here?" Interactive Filter: Instead of a wall of courses, present clean interactive cards directing visitors to specific tracks: Healing & Heartbreak, Relationships, Blended Families, Parenting/Co-parenting, Personal Growth, and New Beginnings.

Footer: Comprehensive links (Courses, About, Resources, Blog, FAQ, WhatsApp, Legal/Privacy, and social icons).

Course Catalog & Details Pages:

Filterable course lists (Fresh Start vs. Blended Family tracks).

Individual course pages with clear outcomes, target audience (Who it's for), curriculum accordion, module/lesson counts, duration, and transparent pricing in KES/USD.

Content Tracks (Blended Families & New Beginnings):

Dedicated landing pages explaining common challenges, step-parent support, boundaries, communication, and relevant course recommendations.

About Jackie Page:

Professional biography, qualifications, core philosophy, areas of expertise, media appearances, and testimonials.

Authentication Flows (Login, Register, Forgot Password):

Clean card layout centered on the Soft Cream Linen background. Support for Email/Password and Social Auth (Google/Facebook) placeholders.

4. Student Dashboard

A fully functional student portal featuring:

Overview: Welcome message, profile avatar, motivational greeting, and quick progress snapshot.

Continue Learning: Prominent card tracking the student's most recently active lesson with a direct "Resume" link.

My Courses & Progress: Visual progress bars, completed lessons counter, and module access status.

Certificates: Dedicated section displaying earned course certificates featuring the student's name rendered in a soft serif italic font, unique certificate verification IDs, and download triggers.

Payment History: Clean table listing past orders, amounts in KES, payment methods (M-Pesa/Paystack), transaction IDs, and status.

Account Settings: Personal info editing, password updates, and notification preferences.

5. Database Schema Requirements (Supabase PostgreSQL)

Generate tables with proper foreign key relationships and constraints:

users: ID, name, email, profile photo, auth providers, timestamps.

courses: ID, title, slug, description, category (fresh_start | blended_family), thumbnail_url, price_kes, is_published.

modules: ID, course_id (FK), title, sort_order.

lessons: ID, module_id (FK), title, bunny_video_id, duration_seconds, is_preview, sort_order.

enrollments: ID, user_id (FK), course_id (FK), enrolled_at, expires_at (42-day access rule logic), status (active | expired | revoked).

lesson_progress: ID, user_id (FK), lesson_id (FK), is_completed, completed_at.

payments: ID, user_id (FK), amount, currency (KES), provider (paystack | mpesa_direct), provider_transaction_id, status (pending | successful | failed), created_at.

certificates: ID, user_id (FK), course_id (FK), certificate_number, recipient_name_formatted, issued_at, pdf_url.

6. Checkout & Payment Simulation

Clear, mobile-first checkout modal supporting M-Pesa and Paystack.

Explicit display of item description, base price, discounts, and final total in KES.

Post-payment success state simulating confirmation, automatic enrollment creation, and instant redirection to the student dashboard.

7. Explicit Scope Exclusions (Post-Lovable Phase)

Do not build the following modules in this initial Lovable generation; keep placeholders ready:

Booking/Scheduling system (Excluded from current scope).

Automated daily 42-day expiry cron jobs.

Advanced Bunny Stream HMAC signed video token generation.

Transactional email triggers (Resend/SendGrid).

Secure digital book download engines.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3fe2015f-846c-4e2d-a2c5-4ad0c97a9c8c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
