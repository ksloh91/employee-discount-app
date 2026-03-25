import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  History,
  House,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import { employeeNavTutorialStorageKey } from "../lib/employeeNavTutorialStorage";

function buildSteps() {
  return [
    {
      key: "welcome",
      icon: Sparkles,
      title: "Welcome",
      subtitle: "Here’s a quick tour",
      body: "Perkaholics is easiest on your phone. Use the bottom bar like an app to move between Home, your deals, past redemptions, and sign out.",
      hint: "You can skip anytime — after you sign out and back in, we’ll offer this tour again.",
    },
    {
      key: "home",
      icon: House,
      title: "Home",
      subtitle: "Start here",
      body: "Tap Home to return to the main hub, see announcements, and jump back into the experience.",
      hint: "On larger screens, the same links appear in the header.",
    },
    {
      key: "deals",
      icon: BadgePercent,
      title: "Deals",
      subtitle: "Browse & redeem",
      body: "Open Deals to explore offers from partners, view details, and redeem when you’re ready.",
      hint: "Redeeming saves a record you can review later under History.",
    },
    {
      key: "history",
      icon: History,
      title: "History",
      subtitle: "Past redemptions",
      body: "History lists what you’ve already redeemed so you can track usage at a glance.",
      hint: "Pull to refresh isn’t required — use the refresh actions on each page when available.",
    },
    {
      key: "logout",
      icon: Ticket,
      title: "Sign out",
      subtitle: "Leave securely",
      body: "The Logout tab ends your session on this device. Sign in again anytime with your work email.",
      hint: "You’re all set — tap Done to start exploring.",
    },
  ];
}

export default function EmployeeNavTutorial({ userId }) {
  const storageKey = useMemo(
    () => employeeNavTutorialStorageKey(userId),
    [userId],
  );

  const steps = useMemo(() => buildSteps(), []);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepDir, setStepDir] = useState(1);
  const touchStartX = useRef(null);

  useEffect(() => {
    if (!userId) return;
    try {
      if (localStorage.getItem(storageKey) === "1") return;
    } catch {
      /* ignore */
    }
    const id = requestAnimationFrame(() => {
      setMounted(true);
      setOpen(true);
    });
    return () => cancelAnimationFrame(id);
  }, [storageKey, userId]);

  useEffect(() => {
    if (!mounted) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted]);

  const finishClose = useCallback(() => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
    window.setTimeout(() => setMounted(false), 380);
  }, [storageKey]);

  const goNext = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      finishClose();
      return;
    }
    setStepDir(1);
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [finishClose, stepIndex, steps.length]);

  const goBack = useCallback(() => {
    if (stepIndex <= 0) return;
    setStepDir(-1);
    setStepIndex((i) => Math.max(i - 1, 0));
  }, [stepIndex]);

  const skip = useCallback(() => {
    finishClose();
  }, [finishClose]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const end = e.changedTouches[0]?.clientX;
    if (end == null) return;
    const delta = end - start;
    const threshold = 56;
    if (delta < -threshold) goNext();
    else if (delta > threshold) goBack();
  };

  if (!mounted) return null;

  const step = steps[stepIndex];
  const Icon = step.icon;
  const isLast = stepIndex === steps.length - 1;
  const slideVar =
    stepDir >= 0 ? "18px" : "-18px";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-tutorial-title"
      aria-describedby="employee-tutorial-desc"
    >
      <button
        type="button"
        aria-label="Close tour"
        className={`tutorial-motion-backdrop-in absolute inset-0 border-0 bg-slate-950/65 backdrop-blur-sm ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{
          animationName: open ? "tutorial-backdrop-in" : "tutorial-backdrop-out",
          animationDuration: open ? "280ms" : "240ms",
          animationTimingFunction: open
            ? "cubic-bezier(0.22, 1, 0.36, 1)"
            : "ease-in",
          animationFillMode: "both",
        }}
        onClick={skip}
      />

      <div
        className={`tutorial-motion-sheet-in relative w-full max-w-md overflow-hidden rounded-t-[28px] border border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 shadow-[0_-32px_80px_-20px_rgba(0,0,0,0.85)] sm:rounded-[28px] sm:shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{
          animationName: open ? "tutorial-sheet-in" : "tutorial-sheet-out",
          animationDuration: open ? "420ms" : "320ms",
          animationTimingFunction: open
            ? "cubic-bezier(0.22, 1, 0.36, 1)"
            : "cubic-bezier(0.4, 0, 1, 1)",
          animationFillMode: "both",
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex justify-center pt-3 pb-1 sm:pt-4">
          <span className="h-1 w-10 rounded-full bg-white/20" aria-hidden />
        </div>

        <div className="flex items-start justify-between gap-3 px-5 pt-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300/90">
            Quick tour
          </p>
          <button
            type="button"
            onClick={skip}
            className="-m-2 inline-flex items-center gap-1 rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
          >
            <span className="sr-only">Skip tour</span>
            <X className="size-5" />
          </button>
        </div>

        <div className="px-5 pb-6 pt-4 sm:px-6 sm:pb-7 sm:pt-5">
          <div
            key={step.key}
            id="employee-tutorial-desc"
            className="tutorial-motion-step"
            style={
              {
                "--tutorial-dx": slideVar,
                animationName: "tutorial-step-in",
                animationDuration: "340ms",
                animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                animationFillMode: "both",
              }
            }
          >
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/25 to-indigo-500/20 ring-1 ring-white/10">
                <Icon className="size-7 text-amber-300" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <h2
                  id="employee-tutorial-title"
                  className="text-lg font-semibold tracking-tight text-white"
                >
                  {step.title}
                </h2>
                <p className="text-sm font-medium text-primary">{step.subtitle}</p>
              </div>
            </div>
            <p className="mt-5 text-[15px] leading-relaxed text-slate-300">
              {step.body}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              {step.hint}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-1.5" aria-hidden="true">
              {steps.map((s, i) => (
                <span
                  key={s.key}
                  className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                    i === stepIndex
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-slate-600"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goBack}
                disabled={stepIndex === 0}
                className="inline-flex size-11 items-center justify-center rounded-full border border-slate-600 text-slate-200 transition enabled:active:scale-95 enabled:hover:border-primary enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="inline-flex h-11 min-w-[7.5rem] items-center justify-center gap-1 rounded-full bg-gradient-to-r from-[var(--color-orange-03)] to-[var(--color-orange-04)] px-5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-900/30 transition active:translate-y-px active:scale-[0.98] hover:from-[var(--color-orange-02)] hover:to-[var(--color-orange-04)]"
              >
                {isLast ? (
                  "Done"
                ) : (
                  <>
                    Next
                    <ChevronRight className="size-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] text-slate-500">
            Swipe left or right to change steps
          </p>
        </div>
      </div>
    </div>
  );
}
