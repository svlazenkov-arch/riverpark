# River Park - PWA приложение для управления ЖК

## Overview

River Park is a Progressive Web Application (PWA) designed to serve residents of the River Park residential complex. Its core purpose is to centralize and streamline communication and management of housing-related services. Residents can manage utility payments, submit meter readings, create service requests, participate in votings, and receive important notifications. The project aims to enhance resident convenience and operational efficiency by providing a unified digital platform for all essential ЖК (housing complex) interactions.

## User Preferences

I prefer concise and direct communication. When suggesting code changes, provide clear justifications and examples. I value iterative development, so propose changes in manageable steps. Please ask for confirmation before implementing significant architectural changes or adding new external dependencies. Ensure all explanations are easy to understand, avoiding overly technical jargon where simpler terms suffice. Do not make changes to the `shared/schema.ts` file without explicit approval, as it defines the core data structure.

## System Architecture

The application adopts a design-first approach with a green color palette (`#2d5a3d`) consistent with River Park's branding, utilizing Shadcn UI components for a consistent and adaptive mobile-first design.

### Frontend

-   **Framework:** React 18 with TypeScript
-   **Routing:** Wouter (URL-based: `/`, `/bills`, `/notifications`, `/profile`, `/news`, `/contacts`, `/admin`)
-   **State Management & Caching:** TanStack Query
-   **UI Library & Styling:** Shadcn UI + Tailwind CSS
-   **Build Tool:** Vite

### Backend

-   **Framework:** Express.js
-   **ORM:** Drizzle ORM
-   **Authentication:** Passport.js (Local Strategy, bcryptjs for hashing, express-session with PostgreSQL store)
-   **Key API Endpoints:** Authentication, User & Apartment management, Bills, Meter Readings, Service Requests, Content (news, documents, votings), Notifications.
-   **Roles:** `resident` (default) and `admin` (elevated privileges for management).

### Database

PostgreSQL is the chosen database, with a schema designed to support:
-   `users`, `sessions`, `apartments`
-   `bills`, `meterReadings`
-   `serviceRequests`
-   `news`, `documents`, `votings`, `votingOptions`, `votes`
-   `notifications`

### UI/UX Decisions

-   Green color palette (`#2d5a3d`) for branding consistency.
-   Shadcn UI components for a cohesive and modern user interface.
-   Adaptive design for optimal mobile experience.
-   Admin Panel for managing news and documents, with role-based access control.

### Feature Specifications

-   **Service Request Notifications:** Automated webhook notifications to n8n for new service requests, integrating with Telegram.
-   **Admin Panel:** Provides CRUD operations for news articles and documents, accessible only to `admin` users. Includes frontend and backend access control.
-   **Profile Editing:** Users can edit personal information (name, phone, email) with client-side and server-side validation.
-   **Object Storage Integration:** Utilizes Replit Object Storage for file uploads (e.g., documents), with ACL management for public/private access. Supports both external URLs and direct file uploads.

## External Dependencies

-   **Database Hosting:** Neon (for PostgreSQL)
-   **Webhook Integration:** n8n (for workflow automation, e.g., service request notifications)
-   **Messaging:** Telegram Bot API (via n8n for administrative alerts)
-   **Object Storage:** Replit Object Storage (for file uploads)