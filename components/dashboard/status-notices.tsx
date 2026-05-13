"use client";

import { useEffect, useState } from "react";
import { BellOff, FlaskConical, X } from "lucide-react";

type Notice = {
  icon: typeof FlaskConical;
  key: string;
  text: string;
};

type DashboardStatusNoticesProps = {
  showBusinessSmsOffNotice: boolean;
  showCustomerSmsTestNotice: boolean;
};

const customerSmsTestNoticeKey = "leadresponse_hide_customer_sms_test_notice";
const businessSmsOffNoticeKey = "leadresponse_hide_business_sms_off_notice";

export function DashboardStatusNotices({
  showBusinessSmsOffNotice,
  showCustomerSmsTestNotice
}: DashboardStatusNoticesProps) {
  const [hiddenKeys, setHiddenKeys] = useState<Set<string> | null>(null);

  useEffect(() => {
    setHiddenKeys(
      new Set(
        [customerSmsTestNoticeKey, businessSmsOffNoticeKey].filter(
          (key) => localStorage.getItem(key) === "true"
        )
      )
    );
  }, []);

  if (!hiddenKeys) {
    return null;
  }

  const notices: Notice[] = [
    showCustomerSmsTestNotice
      ? {
          icon: FlaskConical,
          key: customerSmsTestNoticeKey,
          text: "Customer SMS test mode active — customer replies are routed to the test phone number."
        }
      : null,
    showBusinessSmsOffNotice
      ? {
          icon: BellOff,
          key: businessSmsOffNoticeKey,
          text: "Business SMS alerts are off — new leads will not trigger SMS alerts until enabled."
        }
      : null
  ].filter((notice): notice is Notice => Boolean(notice));

  const visibleNotices = notices.filter((notice) => !hiddenKeys.has(notice.key));

  if (visibleNotices.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      {visibleNotices.map((notice) => {
        const Icon = notice.icon;

        return (
          <div
            className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white/85 px-4 py-3 text-sm text-slate-700 shadow-soft"
            key={notice.key}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-accent">
                <Icon className="h-4 w-4" />
              </span>
              <p className="leading-6">{notice.text}</p>
            </div>
            <button
              aria-label="Hide notice"
              className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-muted transition hover:bg-cyan-50 hover:text-accent"
              onClick={() => {
                localStorage.setItem(notice.key, "true");
                setHiddenKeys((current) => {
                  const next = new Set(current ?? []);
                  next.add(notice.key);
                  return next;
                });
              }}
              type="button"
            >
              Hide
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
