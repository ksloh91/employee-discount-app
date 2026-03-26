import { useCallback, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { ToastContext } from "./ToastContext";

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getVariantStyles(variant) {
  if (variant === "success") {
    return {
      container:
        "border-emerald-400/25 bg-emerald-950/35 text-emerald-200",
      icon: "text-emerald-300",
    };
  }
  if (variant === "error") {
    return { container: "border-rose-400/25 bg-rose-950/35 text-rose-200", icon: "text-rose-300" };
  }
  return { container: "border-white/10 bg-white/5 text-slate-100", icon: "text-slate-200" };
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    const t = timeoutsRef.current.get(id);
    if (t) {
      window.clearTimeout(t);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const toast = useCallback(({ title, description, variant = "info", duration = 3600 }) => {
    const id = createId();
    setToasts((current) => [
      ...current,
      { id, title, description, variant, phase: "in" },
    ]);

    // Mark as leaving slightly before removing for smoother UX.
    const outDelay = Math.max(0, duration - 260);
    window.setTimeout(() => {
      setToasts((current) =>
        current.map((t) => (t.id === id ? { ...t, phase: "out" } : t)),
      );
    }, outDelay);

    const rm = window.setTimeout(() => removeToast(id), duration);
    timeoutsRef.current.set(id, rm);
  }, [removeToast]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed left-1/2 top-4 z-[60] w-full max-w-md -translate-x-1/2 px-4 pointer-events-none"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div className="flex flex-col gap-2">
          {toasts.map((t) => {
            const styles = getVariantStyles(t.variant);
            const Icon =
              t.variant === "success"
                ? CheckCircle2
                : t.variant === "error"
                  ? AlertTriangle
                  : Info;

            return (
              <div
                key={t.id}
                className={[
                  "rounded-2xl border px-4 py-3 shadow-[0_24px_55px_-30px_rgba(2,6,23,0.85)] backdrop-blur-xl pointer-events-auto",
                  styles.container,
                  t.phase === "in" ? "toast-phase-in" : "toast-phase-out",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`mt-0.5 size-5 ${styles.icon}`} strokeWidth={2} />
                  <div className="min-w-0">
                    {t.title ? (
                      <p className="text-sm font-semibold leading-5">{t.title}</p>
                    ) : null}
                    {t.description ? (
                      <p className="mt-0.5 text-xs leading-4 text-slate-200/90">
                        {t.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

