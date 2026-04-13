import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

export default function RedeemModal({
  isOpen,
  deal,
  redeemedCountByUser,
  selectedDealTotalRedeemed,
  checkingLimits,
  redeemError,
  onClose,
  onRedeemAttempt,
}) {
  const [sliderComplete, setSliderComplete] = useState(false);
  const [sliderTravelPx, setSliderTravelPx] = useState(0);
  const [sliderOffsetPx, setSliderOffsetPx] = useState(0);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  const sliderTrackRef = useRef(null);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const dragDisabledRef = useRef(false);

  const maxPerUser = deal?.maxPerUserRedemptions ?? null;
  const maxTotal = deal?.maxTotalRedemptions ?? null;
  const perUserLimitReached =
    maxPerUser != null && redeemedCountByUser >= maxPerUser;
  const totalLimitReached =
    maxTotal != null && selectedDealTotalRedeemed >= maxTotal;
  const fullyRedeemed = perUserLimitReached || totalLimitReached;
  const sliderProgressRatio =
    sliderTravelPx > 0
      ? (sliderComplete ? sliderTravelPx : sliderOffsetPx) / sliderTravelPx
      : 0;
  const sliderProgressPercent = `${Math.round(
    clamp(sliderProgressRatio, 0, 1) * 100,
  )}%`;

  const triggerHapticImpact = async (style) => {
    try {
      await Haptics.impact({ style });
    } catch {
      // Ignore unsupported platforms (e.g. desktop web).
    }
  };

  const triggerHapticNotification = async (type) => {
    try {
      await Haptics.notification({ type });
    } catch {
      // Ignore unsupported platforms (e.g. desktop web).
    }
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setSliderComplete(false);
    setSliderOffsetPx(0);
    setIsDraggingSlider(false);
  }, [isOpen, deal?.id]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const recalcSliderTravel = () => {
      const track = sliderTrackRef.current;
      if (!track) return;
      const knobWidth = 96; // w-24
      const inset = 2; // 0.5 * 4px
      const travel = Math.max(0, track.clientWidth - knobWidth - inset * 2);
      setSliderTravelPx(travel);
      setSliderOffsetPx((current) =>
        sliderComplete ? travel : Math.min(current, travel),
      );
    };

    const rafId = requestAnimationFrame(recalcSliderTravel);
    window.addEventListener("resize", recalcSliderTravel);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", recalcSliderTravel);
    };
  }, [isOpen, sliderComplete]);

  const startDrag = (clientX, disabled) => {
    if (disabled || sliderComplete) return;
    dragDisabledRef.current = disabled;
    setIsDraggingSlider(true);
    dragStartXRef.current = clientX;
    dragStartOffsetRef.current = sliderOffsetPx;
    void triggerHapticImpact(ImpactStyle.Light);
  };

  const moveDrag = (clientX) => {
    const next = clamp(
      dragStartOffsetRef.current + (clientX - dragStartXRef.current),
      0,
      sliderTravelPx,
    );
    setSliderOffsetPx(next);
  };

  const endDrag = async (disabled) => {
    if (!isDraggingSlider) return;
    setIsDraggingSlider(false);
    if (disabled || sliderComplete) return;

    const threshold = sliderTravelPx * 0.92;
    if (sliderOffsetPx >= threshold && sliderTravelPx > 0) {
      setSliderOffsetPx(sliderTravelPx);
      void triggerHapticImpact(ImpactStyle.Medium);
      const ok = await onRedeemAttempt();
      if (!ok) {
        setSliderOffsetPx(0);
        void triggerHapticNotification(NotificationType.Warning);
      } else {
        setSliderComplete(true);
        void triggerHapticNotification(NotificationType.Success);
      }
      return;
    }
    setSliderOffsetPx(0);
    void triggerHapticImpact(ImpactStyle.Light);
  };

  useEffect(() => {
    if (!isDraggingSlider) return undefined;

    const onMouseMove = (event) => {
      moveDrag(event.clientX);
    };

    const onTouchMove = (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      event.preventDefault();
      moveDrag(touch.clientX);
    };

    const onEnd = () => {
      void endDrag(dragDisabledRef.current);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [isDraggingSlider, sliderComplete, sliderOffsetPx, sliderTravelPx]);

  if (!isOpen || !deal || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-slate-950/70 p-4 backdrop-blur-sm animate-[fadeIn_160ms_ease-out]">
      <div className="absolute left-1/2 top-1/2 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-white/15 bg-slate-900/92 p-5 shadow-2xl backdrop-blur-xl animate-[fadeScaleIn_180ms_ease-out]">
        <div className="space-y-2">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.25em] text-slate-400">
            Confirm redemption
          </p>
          <h2 className="text-lg font-semibold tracking-tight text-white">
            {deal.merchantName}
          </h2>
          <p className="text-xs text-slate-300">{deal.title}</p>
        </div>

        <p className="mt-4 text-xs text-slate-300">
          Are you sure you want to redeem this offer now? Some offers may be
          single-use and start their validity as soon as you reveal the code.
        </p>

        <div className="mt-5 space-y-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Slide to redeem
          </p>
          <p className="text-[0.7rem] text-slate-400">
            Redeemed by you:{" "}
            <span className="font-semibold text-slate-100">
              {redeemedCountByUser}
            </span>
            {maxPerUser != null && (
              <>
                {" "}
                / <span className="font-semibold text-slate-100">{maxPerUser}</span>
              </>
            )}
          </p>
          {maxTotal != null && (
            <p className="text-[0.7rem] text-slate-400">
              Total redeemed:{" "}
              <span className="font-semibold text-slate-100">
                {selectedDealTotalRedeemed}
              </span>{" "}
              / <span className="font-semibold text-slate-100">{maxTotal}</span>
            </p>
          )}
          {redeemError && (
            <p className="text-xs font-semibold text-red-600">{redeemError}</p>
          )}
        </div>

        {fullyRedeemed && !redeemError && (
          <p className="mt-2 text-xs font-semibold text-red-600">Fully redeemed</p>
        )}
        {checkingLimits && (
          <p className="mt-2 text-xs text-slate-400">Checking limits...</p>
        )}

        <button
          ref={sliderTrackRef}
          type="button"
          disabled={checkingLimits || fullyRedeemed}
          className={`mt-3 relative flex h-10 w-full items-center overflow-hidden rounded-full text-xs font-medium shadow-inner transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
            fullyRedeemed
              ? "cursor-not-allowed bg-slate-700 text-slate-300"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0.5 left-0.5 rounded-full transition-[width] duration-75 ${
              fullyRedeemed ? "bg-transparent" : "bg-orange-200/80"
            }`}
            style={{
              width:
                sliderProgressPercent === "0%"
                  ? "0%"
                  : `calc(${sliderProgressPercent} - 0.25rem)`,
            }}
          />
          <span
            role="slider"
            aria-valuemin={0}
            aria-valuemax={Math.round(sliderTravelPx)}
            aria-valuenow={Math.round(
              sliderComplete ? sliderTravelPx : sliderOffsetPx,
            )}
            aria-label="Slide to redeem"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture?.(event.pointerId);
              startDrag(event.clientX, checkingLimits || fullyRedeemed);
            }}
            onTouchStart={(event) => {
              const t = event.touches[0];
              if (!t) return;
              startDrag(t.clientX, checkingLimits || fullyRedeemed);
            }}
            onPointerCancel={() => {
              setIsDraggingSlider(false);
              setSliderOffsetPx(sliderComplete ? sliderTravelPx : 0);
            }}
            className={`absolute inset-y-0.5 left-0.5 z-20 flex w-24 select-none items-center justify-center rounded-full bg-orange-300 text-[0.7rem] font-semibold text-slate-950 shadow transition-transform ease-out ${
              isDraggingSlider ? "cursor-grabbing duration-75" : "cursor-grab duration-300"
            } ${fullyRedeemed ? "hidden" : ""}`}
            style={{
              transform: `translateX(${sliderComplete ? sliderTravelPx : sliderOffsetPx}px)`,
            }}
          >
            Slide
          </span>
          <span className="relative z-10 mx-auto text-[0.7rem]">
            {fullyRedeemed
              ? "Limit reached"
              : sliderComplete
                ? "Redeemed"
                : isDraggingSlider
                  ? ">>>>> Slide to reveal QR & code >>>>>"
                  : "Slide to reveal QR & code"}
          </span>
        </button>

        {sliderComplete && (
          <div className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-slate-800/70 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-900 text-[0.6rem] font-semibold text-slate-300 ring-1 ring-dashed ring-slate-500">
                QR
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-100">
                  Show this at checkout
                </p>
                <p className="text-[0.7rem] text-slate-300">
                  The QR code and promo code below are now active.
                </p>
              </div>
            </div>
            {deal.code && (
              <div className="mt-2 rounded-lg bg-slate-950 px-3 py-2 text-center ring-1 ring-white/10">
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-slate-400">
                  Promo code
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-white">
                  {deal.code}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2 text-xs">
          <button
            type="button"
            className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
