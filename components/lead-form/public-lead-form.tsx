"use client";

import { useState } from "react";
import { submitPublicLead } from "@/app/lead-form/[businessId]/actions";
import { FieldError } from "@/components/ui/field-error";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  isValidOptionalAustralianPhone,
  isValidOptionalEmail
} from "@/lib/forms/validation";

type PublicLeadFormProps = {
  businessId: string;
  initialError?: "invalid_email" | "invalid_phone";
};

type FormErrors = {
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  originalMessage?: string;
};

export function PublicLeadForm({
  businessId,
  initialError
}: PublicLeadFormProps) {
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
      action={submitPublicLead.bind(null, businessId)}
      className="app-card p-6"
      noValidate
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        const nextErrors: FormErrors = {};
        const customerName = String(formData.get("customer_name") ?? "");
        const customerPhone = String(formData.get("customer_phone") ?? "");
        const customerEmail = String(formData.get("customer_email") ?? "");
        const originalMessage = String(formData.get("original_message") ?? "");

        if (!customerName.trim()) {
          nextErrors.customerName = "Please enter your name.";
        }

        if (!originalMessage.trim()) {
          nextErrors.originalMessage = "Please enter your enquiry.";
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
        <div className="md:col-span-2">
          <label className="app-label" htmlFor="customer_name">
            Name
          </label>
          <input
            aria-describedby={errors.customerName ? "customer_name_error" : undefined}
            aria-invalid={Boolean(errors.customerName)}
            className="app-input"
            id="customer_name"
            name="customer_name"
            type="text"
          />
          <FieldError id="customer_name_error" message={errors.customerName} />
        </div>

        <div>
          <label className="app-label" htmlFor="customer_phone">
            Phone
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
            Email
          </label>
          <input
            aria-describedby={
              errors.customerEmail ? "customer_email_error" : undefined
            }
            aria-invalid={Boolean(errors.customerEmail)}
            className="app-input"
            id="customer_email"
            name="customer_email"
            type="text"
          />
          <FieldError id="customer_email_error" message={errors.customerEmail} />
        </div>

        <div className="md:col-span-2">
          <label className="app-label" htmlFor="original_message">
            Message
          </label>
          <textarea
            aria-describedby={
              errors.originalMessage ? "original_message_error" : undefined
            }
            aria-invalid={Boolean(errors.originalMessage)}
            className="app-input min-h-36 resize-y"
            id="original_message"
            name="original_message"
          />
          <FieldError
            id="original_message_error"
            message={errors.originalMessage}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <SubmitButton pendingText="Sending enquiry...">Send enquiry</SubmitButton>
      </div>
    </form>
  );
}
