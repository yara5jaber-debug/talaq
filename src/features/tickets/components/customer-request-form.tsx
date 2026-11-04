"use client";

import { useRef, useState, type FormEvent } from "react";

interface CustomerRequestFormProps {
  onCreate: (subject: string, description: string) => Promise<boolean>;
}

interface FormErrors {
  subject?: string;
  description?: string;
}

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
        "تعذّر تأكيد الحفظ. حدّث الصفحة وتحقق من طلباتك قبل إعادة الإرسال.",
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
      className="mt-7 space-y-6"
    >
      <div>
        <label htmlFor="request-subject" className="block text-sm font-medium">
          عنوان المشكلة
        </label>

        <p id="subject-hint" className="mt-1 text-xs leading-6 text-muted">
          لخّص المشكلة بجملة واحدة، من 5 إلى 120 حرفًا.
        </p>

        <input
          ref={subjectRef}
          id="request-subject"
          name="subject"
          dir="auto"
          value={subject}
          disabled={isSubmitting}
          onChange={(event) => {
            setSubject(event.target.value);
            setErrors((current) => ({ ...current, subject: undefined }));
          }}
          required
          maxLength={120}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={
            errors.subject ? "subject-hint subject-error" : "subject-hint"
          }
          placeholder="مثال: حسابي لم يتفعّل بعد الاشتراك"
          className="mt-3 min-h-12 w-full border border-line bg-surface px-3 py-2 text-sm aria-[invalid=true]:border-brand"
        />

        {errors.subject && (
          <p id="subject-error" className="mt-2 text-xs text-brand">
            {errors.subject}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="request-description"
          className="block text-sm font-medium"
        >
          احكِ لنا التفاصيل
        </label>

        <p id="description-hint" className="mt-1 text-xs leading-6 text-muted">
          شو توقعت يصير، وشو صار بدلًا منه؟ اكتب 20 حرفًا على الأقل.
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
          rows={7}
          maxLength={3000}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description
              ? "description-hint description-count description-error"
              : "description-hint description-count"
          }
          placeholder="بدأت المشكلة لما..."
          className="mt-3 block w-full resize-y border border-line bg-surface p-3 text-sm leading-8 aria-[invalid=true]:border-brand"
        />

        <p id="description-count" className="mt-2 text-xs text-muted">
          {description.length} / 3000 حرف
        </p>

        {errors.description && (
          <p id="description-error" className="mt-2 text-xs text-brand">
            {errors.description}
          </p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="text-sm leading-7 text-brand">
          {submitError}
        </p>
      )}

      <div className="border-t border-line pt-5">
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-12 w-full bg-brand px-6 py-3 text-sm font-medium text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? "جارٍ حفظ الطلب..." : "إرسال الطلب"}
        </button>

        <p className="mt-3 text-xs leading-6 text-muted">
          جميع الحقول مطلوبة. ستجد طلبك في قائمة طلباتك بعد إرساله.
        </p>
      </div>
    </form>
  );
}