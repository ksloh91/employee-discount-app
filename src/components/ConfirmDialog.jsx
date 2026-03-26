import { useEffect, useMemo, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

function getVariantClasses(variant) {
  if (variant === "danger") {
    return {
      border: "border-rose-400/25",
      bg: "bg-rose-950/35",
      text: "text-rose-100",
      icon: "text-rose-300",
      confirm:
        "border border-rose-300/40 bg-rose-500/15 hover:bg-rose-500/25 hover:border-rose-300/60",
    };
  }
  return {
    border: "border-white/10",
    bg: "bg-white/5",
    text: "text-slate-100",
    icon: "text-amber-300",
    confirm:
      "border border-amber-300/40 bg-amber-300/10 hover:bg-amber-300/15 hover:border-amber-300/70",
  };
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  cancelText,
  variant = "default",
  onConfirm,
  onCancel,
}) {
  const styles = useMemo(() => getVariantClasses(variant), [variant]);
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => cancelBtnRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div
        className={[
          "relative w-full max-w-md overflow-hidden rounded-3xl border shadow-[0_40px_120px_-60px_rgba(0,0,0,0.95)]",
          styles.border,
          styles.bg,
          "confirm-sheet-in",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3 p-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className={`mt-0.5 size-9 rounded-2xl border ${styles.border} bg-white/5 flex items-center justify-center`}>
              <AlertTriangle className={`size-5 ${styles.icon}`} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2 id="confirm-title" className={`text-base font-semibold leading-5 ${styles.text}`}>
                {title}
              </h2>
              {description ? (
                <p className="mt-2 text-sm leading-5 text-slate-200/90">
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex gap-2 border-t border-white/10 p-4 sm:p-5">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={[
              "flex-1 rounded-full px-4 py-2 text-sm font-semibold text-slate-100 transition",
              styles.confirm,
            ].join(" ")}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

