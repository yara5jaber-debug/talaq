"use client";

import { useState, type FormEvent } from "react";
import type { MessageKind } from "@/types/ticket";

interface TicketReplyFormProps {
  onSend: (body: string, kind: MessageKind) => void;
}

export function TicketReplyForm({ onSend }: TicketReplyFormProps) {
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<MessageKind>("reply");
  const [feedback, setFeedback] = useState("");

  const isInternal = kind === "internal_note";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedBody = body.trim();

    if (!trimmedBody) return;

    onSend(trimmedBody, kind);
    setBody("");
    setFeedback(
      isInternal
        ? "تمت إضافة الملاحظة في المعاينة."
        : "تمت إضافة الرد في المعاينة.",
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 border-t border-line pt-6"
    >
      <fieldset>
        <legend className="text-sm font-semibold">
          إضافة إلى المحادثة
        </legend>

        <div className="mt-3 flex flex-wrap gap-4">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="message-kind"
              value="reply"
              checked={!isInternal}
              onChange={() => {
                setKind("reply");
                setFeedback("");
              }}
              className="accent-brand"
            />
            رد للعميل
          </label>

          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="message-kind"
              value="internal_note"
              checked={isInternal}
              onChange={() => {
                setKind("internal_note");
                setFeedback("");
              }}
              className="accent-brand"
            />
            ملاحظة داخلية
          </label>
        </div>
      </fieldset>

      <div
        className={`mt-3 border p-4 ${
          isInternal
            ? "border-warning bg-warning-soft"
            : "border-line bg-surface"
        }`}
      >
        <label
          htmlFor="message-body"
          className="block text-sm font-medium"
        >
          {isInternal ? "نص الملاحظة الداخلية" : "نص الرد"}
        </label>

        <p id="message-help" className="mt-1 text-xs leading-6 text-muted">
          {isInternal
            ? "مخصصة لفريق الدعم داخل الطلب."
            : "هذا النوع من الرسائل مخصص للظهور للعميل."}
        </p>

        <textarea
          id="message-body"
          dir="auto"
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
            setFeedback("");
          }}
          aria-describedby="message-help message-length"
          placeholder={
            isInternal
              ? "اكتبي ما يحتاج الفريق معرفته..."
              : "اكتبي ردًا واضحًا يساعد العميل..."
          }
          rows={5}
          maxLength={3000}
          required
          className="mt-3 block w-full resize-y border border-line bg-surface p-3 text-sm leading-7"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span id="message-length" className="text-xs text-muted">
            {body.length} / 3000 حرف
          </span>

          <button
            type="submit"
            disabled={!body.trim()}
            className="min-h-11 bg-brand px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isInternal ? "إضافة ملاحظة" : "إرسال الرد"}
          </button>
        </div>
      </div>

      <p role="status" className="mt-3 text-sm text-success">
        {feedback}
      </p>

      <p className="mt-2 text-xs leading-6 text-muted">
        وضع تجريبي: الرسائل لا تُرسل إلى عميل فعلي، وتُمسح عند تحديث الصفحة.
      </p>
    </form>
  );
}