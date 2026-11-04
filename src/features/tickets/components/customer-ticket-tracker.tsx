"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

export interface CustomerDemoRequest {
  id: string;
  number: number;
  subject: string;
  description: string;
  createdAt: string;
}

interface CustomerMessage {
  id: string;
  body: string;
  createdAt: string;
}

interface CustomerTicketTrackerProps {
  request: CustomerDemoRequest;
}

const dateFormatter = new Intl.DateTimeFormat("ar", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Hebron",
});

export function CustomerTicketTracker({
  request,
}: CustomerTicketTrackerProps) {
  const [messages, setMessages] = useState<CustomerMessage[]>([
    {
      id: `${request.id}-description`,
      body: request.description,
      createdAt: request.createdAt,
    },
  ]);

  const [body, setBody] = useState("");
  const [feedback, setFeedback] = useState("");

  const headingRef = useRef<HTMLHeadingElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanBody = body.trim();

    if (!cleanBody || cleanBody.length > 3000) return;

    const message: CustomerMessage = {
      id: crypto.randomUUID(),
      body: cleanBody,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, message]);
    setBody("");
    setFeedback("أُضيفت رسالتك داخل المعاينة.");
    textareaRef.current?.focus();
  }

  return (
    <div>
      <header className="border-b border-line pb-7">
        <div className="flex flex-wrap items-center gap-3">
          <span dir="ltr" className="font-mono text-sm text-muted">
            TLQ-{request.number}
          </span>

          <span className="bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
            جديد · تجريبي
          </span>
        </div>

        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-4 break-words text-2xl font-semibold leading-relaxed sm:text-3xl"
        >
          {request.subject}
        </h1>

        <p className="mt-3 text-sm leading-7 text-muted">
          هنا تتابع محادثة طلبك وتضيف أي تفاصيل جديدة.
        </p>
      </header>

      <p className="mt-5 border-s-2 border-brand ps-4 text-xs leading-7 text-muted">
        هذه معاينة فقط. الطلب والرسائل لم تصل إلى فريق الدعم، وتُمسح
        عند تحديث الصفحة. الرقم المعروض تجريبي.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section aria-labelledby="customer-conversation-heading" className="min-w-0">
          <h2 id="customer-conversation-heading" className="text-lg font-semibold">
            المحادثة
          </h2>

          <ol aria-label="رسائل الطلب" className="mt-5">
            {messages.map((message, index) => (
              <li key={message.id} className="border-b border-line py-5">
                <article>
                  <header className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">
                      أنت
                      {index === 0 && (
                        <span className="ms-2 text-xs font-normal text-muted">
                          وصف المشكلة
                        </span>
                      )}
                    </h3>

                    <time
                      dateTime={message.createdAt}
                      className="text-xs text-muted"
                    >
                      {dateFormatter.format(new Date(message.createdAt))}
                    </time>
                  </header>

                  <p
                    dir="auto"
                    className="mt-3 whitespace-pre-wrap break-words text-sm leading-8"
                  >
                    {message.body}
                  </p>
                </article>
              </li>
            ))}
          </ol>

          <form onSubmit={handleSend} className="mt-7">
            <label
              htmlFor="customer-follow-up"
              className="block text-sm font-semibold"
            >
              عندك تفاصيل إضافية؟
            </label>

            <p id="follow-up-hint" className="mt-2 text-xs leading-6 text-muted">
              أضفها هنا ضمن نفس الطلب.
            </p>

            <textarea
              ref={textareaRef}
              id="customer-follow-up"
              name="message"
              dir="auto"
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                setFeedback("");
              }}
              rows={4}
              maxLength={3000}
              required
              aria-describedby="follow-up-hint follow-up-count"
              placeholder="اكتب التفاصيل الجديدة..."
              className="mt-3 block w-full resize-y border border-line bg-surface p-3 text-sm leading-8"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p id="follow-up-count" className="text-xs text-muted">
                {body.length} / 3000 حرف
              </p>

              <button
                type="submit"
                disabled={!body.trim()}
                className="min-h-11 bg-brand px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                إضافة رسالة تجريبية
              </button>
            </div>

            <p role="status" className="mt-3 text-sm text-success">
              {feedback}
            </p>
          </form>
        </section>

        <aside
          aria-labelledby="customer-timeline-heading"
          className="min-w-0 border-t border-line pt-6 lg:border-s lg:border-t-0 lg:ps-6 lg:pt-0"
        >
          <h2 id="customer-timeline-heading" className="text-sm font-semibold">
            مسار الطلب
          </h2>

          <ol className="mt-5 space-y-5">
            {messages.map((message, index) => (
              <li
                key={message.id}
                className="border-s-2 border-brand-soft ps-4"
              >
                <p className="text-sm font-medium">
                  {index === 0
                    ? "أنشأت الطلب في المعاينة"
                    : "أضفت رسالة متابعة"}
                </p>

                <time
                  dateTime={message.createdAt}
                  className="mt-1 block text-xs leading-6 text-muted"
                >
                  {dateFormatter.format(new Date(message.createdAt))}
                </time>
              </li>
            ))}
          </ol>

          <p className="mt-6 border-t border-line pt-4 text-xs leading-7 text-muted">
            لا توجد استجابة من موظف في هذه المعاينة.
          </p>
        </aside>
      </div>
    </div>
  );
}