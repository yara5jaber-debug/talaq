"use client";

import { useRef, useState, type FormEvent } from "react";

interface CustomerRequestFormProps {
  onCreate: (subject: string, description: string) => Promise<boolean>;
}

interface FormErrors {
  subject?: string;
  description?: string;
}

const fieldClass =
  "block w-full rounded-md border border-line bg-surface px-3.5 text-sm text-ink transition-colors placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:cursor-wait disabled:bg-canvas disabled:text-muted aria-[invalid=true]:border-brand";

export function CustomerRequestForm({
  onCreate,
}: CustomerRequestFormProps) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const subjectRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const submittingRef = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current) return;

    const cleanSubject = subject.trim();
    const cleanDescription = description.trim();
    const nextErrors: FormErrors = {};

    if (cleanSubject.length < 5 || cleanSubject.length > 120) {
      nextErrors.subject = "اكتب عنوانًا من 5 إلى 120 حرفًا.";
    }

    if (cleanDescription.length < 20 || cleanDescription.length > 3000) {
      nextErrors.description = "اكتب تفاصيل من 20 إلى 3000 حرف.";
    }

    setErrors(nextErrors);
    setSubmitError("");

    if (nextErrors.subject) {
      subjectRef.current?.focus();
      return;
    }

    if (nextErrors.description) {
      descriptionRef.current?.focus();
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const saved = await onCreate(cleanSubject, cleanDescription);

      if (saved) {
        setSubject("");
        setDescription("");
      }
    } catch {
      setSubmitError(
        "تعذّر تأكيد إرسال الطلب. حدّث قائمة طلباتك وتحقق منها قبل إعادة الإرسال.",
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
      className="mt-6 space-y-6"
    >
      <div>
        <label
          htmlFor="request-subject"
          className="block text-sm font-semibold"
        >
          عنوان المشكلة
        </label>

        <p
          id="subject-hint"
          className="mt-1.5 text-xs leading-6 text-muted"
        >
          عنوان مختصر يوضّح المشكلة، من 5 إلى 120 حرفًا.
        </p>

        <input
          ref={subjectRef}
          id="request-subject"
          name="subject"
          type="text"
          dir="auto"
          value={subject}
          disabled={isSubmitting}
          onChange={(event) => {
            setSubject(event.target.value);
            setErrors((current) => ({
              ...current,
              subject: undefined,
            }));
          }}
          required
          maxLength={120}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={
            errors.subject
              ? "subject-hint subject-count subject-error"
              : "subject-hint subject-count"
          }
          placeholder="مثال: تعذّر تحميل الفاتورة"
          className={`${fieldClass} mt-3 min-h-12 py-3`}
        />

        <div className="mt-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {errors.subject && (
              <p
                id="subject-error"
                className="text-xs leading-6 text-brand"
              >
                {errors.subject}
              </p>
            )}
          </div>

          <p
            id="subject-count"
            className="shrink-0 text-xs leading-6 tabular-nums text-muted"
          >
            <bdi>{subject.length} / 120</bdi>
            <span className="sr-only"> حرفًا</span>
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="request-description"
          className="block text-sm font-semibold"
        >
          تفاصيل المشكلة
        </label>

        <p
          id="description-hint"
          className="mt-1.5 text-xs leading-6 text-muted"
        >
          ماذا حدث، وما الذي كنت تتوقعه؟ اكتب 20 حرفًا على الأقل.
        </p>

        <textarea
          ref={descriptionRef}
          id="request-description"
          name="description"
          dir="auto"
          value={description}
          disabled={isSubmitting}
          onChange={(event) => {
            setDescription(event.target.value);
            setErrors((current) => ({
              ...current,
              description: undefined,
            }));
          }}
          required
          rows={6}
          maxLength={3000}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description
              ? "description-hint description-count description-error"
              : "description-hint description-count"
          }
          placeholder="تظهر المشكلة عندما أحاول..."
          className={`${fieldClass} mt-3 min-h-44 resize-y py-3 leading-7`}
        />

        <div className="mt-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {errors.description && (
              <p
                id="description-error"
                className="text-xs leading-6 text-brand"
              >
                {errors.description}
              </p>
            )}
          </div>

          <p
            id="description-count"
            className="shrink-0 text-xs leading-6 tabular-nums text-muted"
          >
            <bdi>{description.length} / 3000</bdi>
            <span className="sr-only"> حرفًا</span>
          </p>
        </div>
      </div>

      {submitError && (
        <p
          role="alert"
          className="rounded-md border border-brand/25 bg-brand-soft px-4 py-3 text-sm leading-7 text-brand"
        >
          {submitError}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting && (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-4 animate-spin motion-reduce:animate-none"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-25"
              />
              <path
                d="M12 3a9 9 0 0 1 9 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}

          {isSubmitting ? "جارٍ إرسال الطلب..." : "إرسال الطلب"}
        </button>

        <p className="mt-3 text-xs leading-6 text-muted">
          جميع الحقول مطلوبة. سيظهر الطلب في قائمتك بعد إرساله.
        </p>
      </div>
    </form>
  );
}