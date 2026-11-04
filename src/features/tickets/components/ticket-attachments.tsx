"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createClient } from "@/lib/supabase/client";

interface TicketAttachmentsProps {
  ticketId: string;
}

interface Attachment {
  path: string;
  url: string;
}

const BUCKET = "ticket-attachments";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function TicketAttachments({
  ticketId,
}: TicketAttachmentsProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadAttachments() {
      try {
        const supabase = createClient();

        // صلاحيات tickets تتحقق من إمكانية فتح الطلب.
        const { data: ticket, error: ticketError } = await supabase
          .from("tickets")
          .select("id")
          .eq("id", ticketId)
          .single();

        if (ticketError || !ticket) {
          throw new Error("Ticket unavailable");
        }

        const { data: files, error: listError } = await supabase.storage
          .from(BUCKET)
          .list(ticketId, {
            limit: 100,
            sortBy: {
              column: "created_at",
              order: "desc",
            },
          });

        if (listError) throw listError;

        const paths = (files ?? [])
          .filter(
            (file) =>
              file.id &&
              /\.(png|jpg|jpeg)$/i.test(file.name),
          )
          .map((file) => `${ticketId}/${file.name}`);

        if (paths.length === 0) {
          if (!cancelled) setAttachments([]);
          return;
        }

        // روابط مؤقتة للصور الموجودة في التخزين الخاص.
        const { data: signedFiles, error: signedError } =
          await supabase.storage
            .from(BUCKET)
            .createSignedUrls(paths, 600);

        if (signedError) throw signedError;

        const nextAttachments: Attachment[] = [];

        for (const file of signedFiles ?? []) {
          if (file.error || !file.path || !file.signedUrl) {
            throw new Error("Could not prepare image link");
          }

          nextAttachments.push({
            path: file.path,
            url: file.signedUrl,
          });
        }

        if (!cancelled) {
          setAttachments(nextAttachments);
        }
      } catch (error) {
        console.error("Failed to load ticket attachments:", error);

        if (!cancelled) {
          setAttachments([]);
          setLoadError(
            "تعذّر تحميل الصور. جرّبي تحديثها، وتحققي أن الطلب ما زال متاحًا لك.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadAttachments();

    return () => {
      cancelled = true;
    };
  }, [ticketId, reloadKey]);

  function refreshAttachments() {
    setIsLoading(true);
    setLoadError("");
    setAttachments([]);
    setReloadKey((current) => current + 1);
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      uploadingRef.current ||
      !selectedFile ||
      isLoading ||
      loadError
    ) {
      return;
    }

    setUploadError("");
    setFeedback("");

    if (
      selectedFile.type !== "image/png" &&
      selectedFile.type !== "image/jpeg"
    ) {
      setUploadError("اختاري صورة بصيغة PNG أو JPG فقط.");
      return;
    }

    if (
      selectedFile.size === 0 ||
      selectedFile.size > MAX_FILE_SIZE
    ) {
      setUploadError("اختاري صورة غير فارغة وحجمها لا يتجاوز 5 MB.");
      return;
    }

    uploadingRef.current = true;
    setIsUploading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setUploadError("انتهت جلسة الدخول. سجّلي الدخول مجددًا.");
        return;
      }

      const extension =
        selectedFile.type === "image/png" ? "png" : "jpg";

      // يتوافق مع المسار المسموح في سياسة الرفع.
      const path = `${ticketId}/${crypto.randomUUID()}.${extension}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, selectedFile, {
          contentType: selectedFile.type,
          cacheControl: "60",
          upsert: false,
        });

      if (error) {
        console.error("Failed to upload attachment:", error);

        setUploadError(
          "تعذّر تأكيد رفع الصورة. حدّثي الصور قبل إعادة المحاولة، وتحققي من الحجم والصلاحيات.",
        );
        return;
      }

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setFeedback("تم رفع الصورة وحفظها مع الطلب.");
      refreshAttachments();
    } catch {
      setUploadError(
        "انقطع الاتصال أثناء الرفع. حدّثي الصور قبل إعادة المحاولة لتجنب رفعها مرتين.",
      );
    } finally {
      uploadingRef.current = false;
      setIsUploading(false);
    }
  }

  return (
    <section
      aria-label="صور الطلب المشتركة"
      className="mt-8 border-t border-line pt-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">
          صور الطلب المشتركة
        </h3>

        <button
          type="button"
          onClick={refreshAttachments}
          disabled={isLoading || isUploading}
          className="min-h-11 text-sm text-brand disabled:opacity-50"
        >
          {isLoading ? "جارٍ التحميل..." : "تحديث الصور"}
        </button>
      </div>

      <p className="mt-2 text-xs leading-7 text-muted">
        الصور هنا يراها العميل وفريق الدعم المخوّل بفتح الطلب.
        وهي مستقلة عن الملاحظات الداخلية.
      </p>

      {loadError && (
        <p role="alert" className="mt-4 text-sm leading-7 text-brand">
          {loadError}
        </p>
      )}

      {!isLoading && !loadError && attachments.length === 0 && (
        <p className="mt-5 text-sm text-muted">
          لا توجد صور مرفقة بعد.
        </p>
      )}

      {!loadError && attachments.length > 0 && (
        <>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {attachments.map((attachment, index) => (
              <li key={attachment.path} className="border border-line p-3">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="block"
                >
                  <Image
                    src={attachment.url}
                    alt={`صورة مرفقة بالطلب رقم ${index + 1}`}
                    width={640}
                    height={400}
                    unoptimized
                    referrerPolicy="no-referrer"
                    className="h-44 w-full bg-canvas object-contain"
                  />

                  <span className="mt-3 block text-xs text-brand">
                    فتح الصورة {index + 1} بحجمها الكامل
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-xs leading-6 text-muted">
            إذا انتهت صلاحية فتح صورة، اضغطي «تحديث الصور».
          </p>

          {attachments.length === 100 && (
            <p className="mt-2 text-xs text-muted">
              تُعرض أحدث 100 صورة.
            </p>
          )}
        </>
      )}

      <form onSubmit={handleUpload} className="mt-6">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium"
        >
          إضافة صورة مشتركة
        </label>

        <p
          id={`${inputId}-hint`}
          className="mt-1 text-xs leading-6 text-muted"
        >
          PNG أو JPG، حتى 5 MB للصورة الواحدة.
        </p>

        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept="image/png,image/jpeg"
          aria-describedby={`${inputId}-hint`}
          disabled={isUploading || isLoading || Boolean(loadError)}
          onChange={(event) => {
            setSelectedFile(event.target.files?.[0] ?? null);
            setUploadError("");
            setFeedback("");
          }}
          className="mt-3 block w-full min-w-0 text-sm text-muted file:me-3 file:border file:border-line file:bg-surface file:px-3 file:py-3 file:text-ink disabled:opacity-50"
        />

        {selectedFile && (
          <p dir="auto" className="mt-3 break-words text-xs text-muted">
            {selectedFile.name}
            {" · "}
            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        )}

        <button
          type="submit"
          disabled={
            !selectedFile ||
            isUploading ||
            isLoading ||
            Boolean(loadError)
          }
          className="mt-4 min-h-11 bg-brand px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? "جارٍ رفع الصورة..." : "رفع الصورة"}
        </button>

        {uploadError && (
          <p role="alert" className="mt-4 text-sm leading-7 text-brand">
            {uploadError}
          </p>
        )}

        <p role="status" className="mt-3 text-sm text-success">
          {feedback}
        </p>
      </form>
    </section>
  );
}