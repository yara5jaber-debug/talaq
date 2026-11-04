import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import { LogoutButton } from "@/features/auth/logout-button";
import type { UserRole } from "@/types/ticket";

export const dynamic = "force-dynamic";

const roleLabels: Record<UserRole, string> = {
  customer: "عميل",
  agent: "موظف دعم",
  admin: "مدير",
};

export default async function AccountPage() {
  const { user, profile } = await requireUser();

  const canManageTickets =
    profile.role === "agent" || profile.role === "admin";

  const linkClassName =
    "inline-flex min-h-11 items-center justify-center border border-brand px-5 py-2 text-sm font-medium text-brand hover:bg-brand-soft";

  return (
    <main className="min-h-screen bg-canvas px-5 py-12 sm:px-8">
      <section
        aria-labelledby="account-heading"
        className="mx-auto max-w-2xl"
      >
        <p
          dir="ltr"
          className="text-start text-xl font-bold tracking-widest text-brand"
        >
          TALAQ
        </p>

        <div className="mt-8 border-y border-line py-8">
          <h1
            id="account-heading"
            className="text-3xl font-semibold"
          >
            أهلًا{profile.fullName ? `، ${profile.fullName}` : " بك"}.
          </h1>

          <dl className="mt-6 space-y-5">
            <div>
              <dt className="text-sm text-muted">
                البريد الإلكتروني
              </dt>
              <dd className="mt-2 break-words font-medium">
                <bdi>{user.email}</bdi>
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted">نوع الحساب</dt>
              <dd className="mt-2 font-medium">
                {roleLabels[profile.role]}
              </dd>
            </div>
          </dl>
        </div>

        <nav
          aria-label="مساحات العمل المتاحة"
          className="mt-6 flex flex-wrap gap-3"
        >
          {profile.role === "customer" && (
            <Link href="/support" className={linkClassName}>
              مساحة الدعم
            </Link>
          )}

          {canManageTickets && (
            <Link href="/" className={linkClassName}>
              صندوق الطلبات
            </Link>
          )}

          {profile.role === "admin" && (
            <Link href="/admin" className={linkClassName}>
              لوحة المدير
            </Link>
          )}
        </nav>

        <div className="mt-8 border-t border-line pt-6">
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}