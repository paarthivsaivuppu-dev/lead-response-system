"use client";

import Link from "next/link";
import { useState } from "react";
import { createLead } from "@/app/dashboard/leads/actions";
import { FieldError } from "@/components/ui/field-error";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  isValidOptionalAustralianPhone,
  isValidOptionalEmail
} from "@/lib/forms/validation";

type FormErrors = {
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
};

type NewLeadFormProps = {
  initialError?: "invalid_email" | "invalid_phone";
};

export function NewLeadForm({ initialError }: NewLeadFormProps) {
  const [errors, setErrors] = useState<FormErrors>({
    customerEmail:
      initialError === "invalid_email"
        ? "Please enter a valid email address, or leave it blank."
        : undefined,
    customerPhone:
      initialError === "invalid_phone"
        ? "Please enter a valid phone number, or leave it blank."
        : undefined
  });

  return (
    <form
      action={createLead}
      className="app-card p-6"
      noValidate
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        const nextErrors: FormErrors = {};
        const customerName = String(formData.get("customer_name") ?? "");
        const customerPhone = String(formData.get("customer_phone") ?? "");
        const customerEmail = String(formData.get("customer_email") ?? "");

        if (!customerName.trim()) {
          nextErrors.customerName = "Please enter the customer name.";
        }

        if (!isValidOptionalAustralianPhone(customerPhone)) {
          nextErrors.customerPhone =
            "Please enter a valid phone number, or leave it blank.";
        }

        if (!isValidOptionalEmail(customerEmail)) {
          nextErrors.customerEmail =
            "Please enter a valid email address, or leave it blank.";
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
          event.preventDefault();
        }
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="app-label" htmlFor="customer_name">
            Customer name
          </label>
          <input
            aria-describedby={errors.customerName ? "customer_name_error" : undefined}
            aria-invalid={Boolean(errors.customerName)}
            className="app-input"
            id="customer_name"
            name="customer_name"
            placeholder="Sarah Mitchell"
            type="text"
          />
          <FieldError id="customer_name_error" message={errors.customerName} />
        </div>

        <div>
          <label className="app-label" htmlFor="source">
            Source
          </label>
          <select
            className="app-input"
            defaultValue="manual"
            id="source"
            name="source"
          >
            <option value="manual">Manual</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="website">Website</option>
          </select>
        </div>

        <div>
          <label className="app-label" htmlFor="customer_phone">
            Customer phone
          </label>
          <input
            aria-describedby={
              errors.customerPhone ? "customer_phone_error" : undefined
            }
            aria-invalid={Boolean(errors.customerPhone)}
            className="app-input"
            id="customer_phone"
            name="customer_phone"
            placeholder="0424 718 402"
            type="tel"
          />
          <FieldError id="customer_phone_error" message={errors.customerPhone} />
        </div>

        <div>
          <label className="app-label" htmlFor="customer_email">
            Customer email
          </label>
          <input
            aria-describedby={
              errors.customerEmail ? "customer_email_error" : undefined
            }
            aria-invalid={Boolean(errors.customerEmail)}
            className="app-input"
            id="customer_email"
            name="customer_email"
            placeholder="customer@example.com"
            type="text"
          />
          <FieldError id="customer_email_error" message={errors.customerEmail} />
        </div>

        <div className="md:col-span-2">
          <label className="app-label" htmlFor="original_message">
            Original message
          </label>
          <textarea
            className="app-input min-h-32 resize-y"
            id="original_message"
            name="original_message"
            placeholder="What did the customer ask for?"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-cyan-50"
          href="/dashboard/leads"
        >
          Cancel
        </Link>
        <SubmitButton pendingText="Creating lead...">Create lead</SubmitButton>
      </div>
    </form>
  );
}
