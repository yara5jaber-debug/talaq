# TALAQ | Arabic Support Ticket Management Platform

**An Arabic-first support ticket management platform built with Next.js, TypeScript, and Supabase.**

TALAQ brings customers, support agents, and administrators together in one workspace to organize support requests, manage conversations, and track issues from creation to resolution.

🌐 **Live Demo:** [Explore TALAQ](https://talaq-l05wpnhw6-yara-projects2.vercel.app/login)

💻 **Repository:** [GitHub](https://github.com/yara5jaber-debug/talaq)

---

## About the Project

Support requests can become difficult to manage when conversations, updates, and responsibilities are scattered across different channels.

TALAQ addresses this problem by providing a centralized support workspace with role-based access and structured ticket management.

The platform supports three user roles:

- **Customer:** Creates support tickets, tracks their status, and communicates with the support team.
- **Support Agent:** Handles assigned tickets, responds to customers, and manages ticket updates.
- **Administrator:** Oversees support operations, assigns tickets, monitors overdue requests, and reviews team workload.

## Key Features

- **Role-Based Authentication:** Separate customer, agent, and administrator experiences.
- **Ticket Management:** Create, assign, search, filter, and update support tickets.
- **Ticket Conversations:** Customer-agent communication with internal notes for support staff.
- **File Attachments:** Upload and access ticket-related attachments.
- **Activity Tracking:** Record and review ticket-related changes.
- **Admin Dashboard:** Monitor ticket statuses, overdue requests, and workload distribution.
- **AI-Powered Summarization:** Use Google Gemini to generate concise summaries of ticket descriptions and recent conversations.
- **Arabic RTL Interface:** Responsive user experience designed for Arabic-speaking users.
- **Demo Access:** Dedicated demo accounts allow visitors to explore the customer and administrator experiences without creating an account.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | Application framework and server-side functionality |
| React 19 | Interactive user interfaces |
| TypeScript | Type safety and maintainable code |
| Tailwind CSS v4 | Responsive styling and UI design |
| Supabase Auth | User authentication and session management |
| PostgreSQL | Relational database |
| Row Level Security (RLS) | Database-level access control |
| Supabase Storage | Ticket attachment storage |
| Google Gemini API | AI-powered ticket summarization |
| Git & GitHub | Version control and source management |
| Vercel | Application deployment and hosting |

## Security & Access Control

Security was an important consideration throughout the development process.

The project uses:

- Supabase Authentication for user identity and session management.
- PostgreSQL Row Level Security (RLS) policies to control access to application data.
- Server-side authorization checks based on user roles.
- Database functions for controlled ticket updates.
- Server-side environment variables for sensitive API credentials.
- Restricted demo accounts designed for read-only exploration.

The demo environment uses sample data and does not allow demo users to modify application records or use live AI summarization.

## AI Integration

TALAQ integrates Google Gemini to summarize support tickets.

The summarization process uses:

1. The ticket subject and description.
2. The ticket status and priority.
3. Up to 20 recent customer-support replies.
4. A structured Arabic prompt to generate a concise summary.

The generated summary highlights:

- The reported problem.
- Actions already attempted.
- The latest development.
- A suggested next step.

Internal notes and attachments are excluded from the summarization input.

## Getting Started

### Prerequisites

- Node.js
- npm
- A Supabase project
- A Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/yara5jaber-debug/talaq.git
cd talaq
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
GEMINI_API_KEY=

DEMO_ADMIN_PASSWORD=
DEMO_CUSTOMER_PASSWORD=
```

Add the corresponding values from your Supabase and Google AI configurations.

The demo passwords must match the dedicated demo users created in Supabase Authentication.

**Important:** Never commit `.env.local` or expose private API keys in client-side code or public repositories.

### 4. Configure Supabase

Configure the required database tables, relationships, Row Level Security policies, database functions, and Storage bucket.

Ensure the database schema and policies are configured before running the application.

Demo accounts and their sample records must also be configured in Supabase.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Access

Visitors can explore TALAQ through the demo access buttons on the login page:

- **Explore Admin Dashboard:** View ticket management and administrative insights.
- **Explore Customer Workspace:** Explore sample tickets and customer conversations.

Demo accounts are restricted and intended for demonstration purposes only.

## Deployment

The application is deployed on Vercel.

Production environment variables must be configured separately in the Vercel project settings.

## Project Structure

```text
src/
├── app/
│   ├── account/
│   ├── admin/
│   ├── login/
│   └── support/
│
├── features/
│   ├── admin/
│   ├── auth/
│   └── tickets/
│       ├── actions/
│       └── components/
│
├── lib/
│   ├── auth/
│   └── supabase/
│
└── types/
```

The project follows a feature-oriented structure to separate authentication, ticket management, administrative functionality, and shared infrastructure.

## Future Improvements

- Expand automated testing coverage.
- Improve attachment management and validation.
- Enhance support analytics and reporting.
- Further optimize application performance and accessibility.

## Author

**Yara Jaber**

Software Engineering Graduate | Front-End Developer

Interested in building responsive, accessible, and practical web applications using modern technologies.

- GitHub: [yara5jaber-debug](https://github.com/yara5jaber-debug)
- Project: [TALAQ](https://talaq-l05wpnhw6-yara-projects2.vercel.app/login)

---

*Built with a focus on usability, structured workflows, and secure data access.*