"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  getTicketMessages,
  sendTicketMessage,
  type SavedMessage,
} from "../actions/ticket-messages";

import { TicketAttachments } from "./ticket-attachments";


interface SavedTicketConversationProps {
  ticketId: string;
}

const dateFormatter = new Intl.DateTimeFormat("ar", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Hebron",
});

export function SavedTicketConversation({
  ticketId,
}: SavedTicketConversationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="mt-8 border-t border-line pt-6">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="min-h-11 text-sm font-semibold text-brand"
      >
        {isOpen ? "إخفاء المحادثة" : "فتح المحادثة والردود"}
      </button>

      {isOpen && (
  <>
    <ConversationContent
      key={`conversation:${ticketId}`}
      ticketId={ticketId}
    />

    <TicketAttachments
      key={`attachments:${ticketId}`}
      ticketId={ticketId}
    />
  </>
)}
  </section>
  );
}

function ConversationContent({
  ticketId,
}: SavedTicketConversationProps) {
  const inputId = useId();
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [canWriteInternal, setCanWriteInternal] = useState(false);
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<"reply" | "internal_note">("reply");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [sendError, setSendError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const sendingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      try {
        const result = await getTicketMessages(ticketId);

        if (cancelled) return;

        if (!result.success) {
          setMessages([]);
          setCanWriteInternal(false);
          setLoadError(result.error);
          return;
        }

        setMessages(result.messages);
        setCanWriteInternal(result.canWriteInternal);

        if (!result.canWriteInternal) {
          setKind("reply");
        }
      } catch {
        if (!cancelled) {
          setMessages([]);
          setCanWriteInternal(false);
          setLoadError("تعذّر تحميل المحادثة. حاول تحديثها.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [ticketId, reloadKey]);

  function refreshConversation() {
    setIsLoading(true);
    setLoadError("");
    setFeedback("");
    setReloadKey((current) => current + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanBody = body.trim();

    if (
      sendingRef.current ||
      isLoading ||
      loadError ||
      cleanBody.length === 0 ||
      cleanBody.length > 3000
    ) {
      return;
    }

    sendingRef.current = true;
    setIsSending(true);
    setSendError("");
    setFeedback("");

    try {
      const result = await sendTicketMessage(ticketId, cleanBody, kind);

      if (!result.success) {
        setSendError(result.error);
        return;
      }

      setMessages((current) => [...current, result.message]);
      setBody("");
      setFeedback(
        result.message.kind === "internal_note"
          ? "تم حفظ الملاحظة الداخلية."
          : "تم إرسال الرد.",
      );
    } catch {
      setSendError(
        "تعذّر تأكيد الإرسال. حدّث المحادثة قبل إعادة المحاولة لتجنب تكرار الرسالة.",
      );
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">المحادثة</h3>

        <button
          type="button"
          onClick={refreshConversation}
          disabled={isLoading || isSending}
          className="min-h-11 text-sm text-brand disabled:opacity-50"
        >
          {isLoading ? "جارٍ التحميل..." : "تحديث المحادثة"}
        </button>
      </div>

      {loadError && (
        <p role="alert" className="mt-4 text-sm leading-7 text-brand">
          {loadError}
        </p>
      )}

      {!isLoading && !loadError && messages.length === 0 && (
        <p className="py-6 text-sm text-muted">
          لا توجد ردود بعد. يمكنك إضافة أول رسالة أدناه.
        </p>
      )}

      {messages.length >= 200 && (
        <p className="mt-3 text-xs text-muted">
          تُعرض أحدث 200 رسالة عند تحميل المحادثة.
        </p>
      )}

      <ol aria-label="رسائل المحادثة" className="mt-4 space-y-5">
        {messages.map((message) => (
          <li
            key={message.id}
            className={
              message.kind === "internal_note"
                ? "border-s-2 border-warning bg-warning-soft p-4"
                : "border-b border-line pb-5"
            }
          >
            {message.kind === "internal_note" && (
              <p className="mb-3 text-xs font-medium text-warning">
                ملاحظة داخلية — لفريق الدعم فقط
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold">{message.authorLabel}</p>
              <time
                dateTime={message.createdAt}
                className="text-xs text-muted"
              >
                {dateFormatter.format(new Date(message.createdAt))}
              </time>
            </div>

            <p
              dir="auto"
              className="mt-3 whitespace-pre-wrap break-words text-sm leading-8"
            >
              {message.body}
            </p>
          </li>
        ))}
      </ol>

      <form onSubmit={handleSubmit} className="mt-8 border-t border-line pt-6">
        <fieldset
          disabled={isSending || isLoading || Boolean(loadError)}
          className="space-y-4"
        >
          <legend className="mb-4 text-sm font-semibold">
            إضافة إلى المحادثة
          </legend>

          {canWriteInternal && (
            <div className="flex flex-wrap gap-5 text-sm">
              <label className="flex min-h-11 items-center gap-2">
                <input
                  type="radio"
                  name={`${inputId}-kind`}
                  checked={kind === "reply"}
                  onChange={() => setKind("reply")}
                  className="accent-brand"
                />
                رد للعميل
              </label>

              <label className="flex min-h-11 items-center gap-2">
                <input
                  type="radio"
                  name={`${inputId}-kind`}
                  checked={kind === "internal_note"}
                  onChange={() => setKind("internal_note")}
                  className="accent-brand"
                />
                ملاحظة داخلية
              </label>
            </div>
          )}

          <div>
            <label htmlFor={inputId} className="block text-sm font-medium">
              {kind === "internal_note" ? "نص الملاحظة" : "نص الرد"}
            </label>

            <textarea
              id={inputId}
              dir="auto"
              rows={5}
              maxLength={3000}
              required
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                setSendError("");
                setFeedback("");
              }}
              className="mt-3 block w-full resize-y border border-line bg-surface p-3 text-sm leading-8"
            />

            <p className="mt-2 text-xs text-muted">
              {body.length} / 3000 حرف
            </p>
          </div>

          <button
            type="submit"
            disabled={!body.trim() || isSending}
            className="min-h-11 bg-brand px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending
              ? "جارٍ الحفظ..."
              : kind === "internal_note"
                ? "حفظ الملاحظة"
                : "إرسال الرد"}
          </button>
        </fieldset>

        {sendError && (
          <p role="alert" className="mt-4 text-sm leading-7 text-brand">
            {sendError}
          </p>
        )}

        <p role="status" className="mt-4 text-sm text-success">
          {feedback}
        </p>
      </form>
    </div>
  );
}