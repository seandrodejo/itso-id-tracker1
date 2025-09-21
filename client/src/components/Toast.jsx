import { useEffect, useMemo } from 'react';

/**
 * Toast notification (accessible, on-brand)
 * Props:
 * - message: string
 * - type: 'success' | 'error' | 'info'
 * - onClose: () => void
 * - duration: number (ms)
 */
export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  // Brand-tinted variants
  const surfaceStyles = useMemo(
    () => ({
      success: {
        card: 'bg-emerald-50/95 border-emerald-200 text-emerald-900 ring-1 ring-emerald-100',
        accent: 'before:bg-emerald-500',
        iconWrap: 'bg-emerald-100 text-emerald-700',
      },
      error: {
        card: 'bg-rose-50/95 border-rose-200 text-rose-900 ring-1 ring-rose-100',
        accent: 'before:bg-rose-500',
        iconWrap: 'bg-rose-100 text-rose-700',
      },
      info: {
        card: 'bg-blue-50/95 border-blue-200 text-blue-900 ring-1 ring-blue-100',
        accent: 'before:bg-blue-500',
        iconWrap: 'bg-blue-100 text-blue-700',
      },
    })[type],
    [type]
  );

  const icon = useMemo(
    () =>
      ({
        success: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ),
        error: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
        info: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 18.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z" />
          </svg>
        ),
      })[type],
    [type]
  );

  // Accessibility: assertive for errors, polite otherwise
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  return (
    <div className="fixed top-6 right-6 z-[100] pointer-events-none">
      <div
        role="status"
        aria-live={ariaLive}
        className={[
          'group relative pointer-events-auto min-w-[300px] max-w-sm',
          'border rounded-2xl shadow-xl px-4 py-3',
          'before:content-[""] before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-2xl',
          'backdrop-blur-sm slide-in-right',
          surfaceStyles.card,
          surfaceStyles.accent,
        ].join(' ')}
      >
        <div className="flex items-start gap-3">
          <div className={[
            'mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0',
            surfaceStyles.iconWrap,
          ].join(' ')}>
            {icon}
            <span className="sr-only">{type}</span>
          </div>

          <div className="flex-1 text-sm leading-5">
            {message}
          </div>

          <button
            onClick={onClose}
            className="-m-1 p-1 rounded-md text-current/60 hover:text-current hover:bg-black/5 transition"
            aria-label="Close notification"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}