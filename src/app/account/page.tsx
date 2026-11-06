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

const spaceLabels: Record<UserRole, string> = {
  customer: "مساحة العميل",
  agent: "مساحة فريق الدعم",
  admin: "مساحة المدير",
};

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand";

export default async function AccountPage() {
  const { user, profile } = await requireUser();

  const isCustomer = profile.role === "customer";
  const isAdmin = profile.role === "admin";
  const workspaceHref = isCustomer ? "/support" : "/";
  const displayName = profile.fullName?.trim() || "مستخدم TALAQ";
  const initial = Array.from(displayName)[0];

  const workspaceDescription = isCustomer
    ? "تابع طلباتك وردود فريق الدعم، أو أرسل طلبًا جديدًا."
    : "راجع الطلبات، وتابع المحادثات، وحدّث حالة العمل.";

  return (
    <div dir="rtl" className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-4">
            <Link
              href={workspaceHref}
              aria-label="TALAQ — مساحة العمل"
              className={`text-2xl font-bold tracking-widest text-brand ${focusClass}`}
            >
              <span dir="ltr">TALAQ</span>
            </Link>

            <span className="hidden border-s border-line ps-4 text-xs text-muted sm:inline">
              {spaceLabels[profile.role]}
            </span>
          </div>

          <nav
            aria-label="التنقل الرئيسي"
            className="flex flex-wrap gap-1 sm:gap-2"
          >
            <Link
              href={workspaceHref}
              className={`inline-flex min-h-11 items-center rounded-md px-3 text-sm text-muted hover:bg-canvas hover:text-ink sm:px-4 ${focusClass}`}
            >
              {isCustomer ? "طلباتي" : "الطلبات"}
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={`inline-flex min-h-11 items-center rounded-md px-3 text-sm text-muted hover:bg-canvas hover:text-ink sm:px-4 ${focusClass}`}
              >
                لوحة المدير
              </Link>
            )}

            <Link
              href="/account"
              aria-current="page"
              className={`inline-flex min-h-11 items-center rounded-md bg-brand-soft px-3 text-sm font-medium text-brand sm:px-4 ${focusClass}`}
            >
              حسابي
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
        <div>
          <p className="text-xs font-medium text-brand">
            معلومات الحساب
          </p>

          <h1 className="mt-3 text-3xl font-semibold leading-normal">
            حسابي
          </h1>

          <p className="mt-3 text-sm leading-7 text-muted">
            بياناتك ومساحات العمل المتاحة لك في TALAQ.
          </p>
        </div>

        <section
          aria-labelledby="profile-heading"
          className="mt-8 overflow-hidden rounded-lg border border-line bg-surface"
        >
          <div className="flex items-center gap-4 border-b border-line px-5 py-6 sm:px-7">
            <div
              aria-hidden="true"
              className="flex size-14 shrink-0 items-center justify-center rounded-full border border-line bg-canvas text-xl font-semibold text-brand"
            >
              {initial}
            </div>

            <div className="min-w-0">
              <h2
                id="profile-heading"
                className="break-words text-lg font-semibold leading-8"
              >
                <bdi>{displayName}</bdi>
              </h2>

              <p className="mt-1 text-sm text-muted">
                {roleLabels[profile.role]}
              </p>
            </div>
          </div>

          <dl className="divide-y divide-line px-5 sm:px-7">
            <div className="grid gap-2 py-5 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6">
              <dt className="text-sm leading-7 text-muted">
                الاسم
              </dt>

              <dd className="min-w-0 break-words text-sm font-medium leading-7">
                <bdi>{profile.fullName?.trim() || "غير مذكور"}</bdi>
              </dd>
            </div>

            <div className="grid gap-2 py-5 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6">
              <dt className="text-sm leading-7 text-muted">
                البريد الإلكتروني
              </dt>

              <dd className="min-w-0 text-sm font-medium leading-7">
                <bdi className="[overflow-wrap:anywhere]">
                  {user.email || "غير مذكور"}
                </bdi>
              </dd>
            </div>

            <div className="grid gap-2 py-5 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6">
              <dt className="text-sm leading-7 text-muted">
                نوع الحساب
              </dt>

              <dd className="text-sm font-medium leading-7">
                {roleLabels[profile.role]}
              </dd>
            </div>
          </dl>
        </section>

        <section
          aria-labelledby="workspace-heading"
          className="mt-9"
        >
          <h2
            id="workspace-heading"
            className="text-lg font-semibold"
          >
            مساحة العمل
          </h2>

          <nav
            aria-label="مساحات العمل المتاحة"
            className={`mt-4 grid gap-4 ${
              isAdmin ? "sm:grid-cols-2" : ""
            }`}
          >
            <Link
              href={workspaceHref}
              className={`group flex items-center justify-between gap-5 rounded-lg border border-line bg-surface p-5 transition-colors hover:border-brand sm:p-6 ${focusClass}`}
            >
              <div className="min-w-0">
                <h3 className="text-base font-semibold group-hover:text-brand">
                  {isCustomer ? "طلباتي والدعم" : "صندوق الطلبات"}
                </h3>

                <p className="mt-2 text-sm leading-7 text-muted">
                  {workspaceDescription}
                </p>
              </div>

              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="size-5 shrink-0 text-brand"
              >
                <path
                  d="M19 12H5m6-6-6 6 6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={`group flex items-center justify-between gap-5 rounded-lg border border-line bg-surface p-5 transition-colors hover:border-brand sm:p-6 ${focusClass}`}
              >
                <div className="min-w-0">
                  <h3 className="text-base font-semibold group-hover:text-brand">
                    لوحة المدير
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-muted">
                    تابع الطلبات المتأخرة وتوزيع العمل على فريق الدعم.
                  </p>
                </div>

                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="size-5 shrink-0 text-brand"
                >
                  <path
                    d="M19 12H5m6-6-6 6 6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            )}
          </nav>
        </section>

        <section
          aria-labelledby="session-heading"
          className="mt-9 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center"
        >
          <div>
            <h2
              id="session-heading"
              className="text-sm font-semibold"
            >
              تسجيل الخروج
            </h2>

            <p className="mt-2 text-xs leading-6 text-muted">
              يمكنك تسجيل الدخول مجددًا للعودة إلى حسابك.
            </p>
          </div>

          <LogoutButton />
        </section>
      </main>
    </div>
  );
}