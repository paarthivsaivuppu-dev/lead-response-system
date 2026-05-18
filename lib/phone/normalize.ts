type PhoneNormalizationResult =
  | {
      ok: true;
      value: string;
    }
  | {
      ok: false;
      raw: string;
      reason: string;
    };

// Australian mobile examples:
// 0424718402 -> +61424718402
// 0424 718 402 -> +61424718402
// 424718402 -> +61424718402
// 61424718402 -> +61424718402
// +61424718402 -> +61424718402
// +61 424 718 402 -> +61424718402
// (02) 9876 5432 -> +61298765432
// +61 2 9876 5432 -> +61298765432
export function normalizeAustralianPhoneNumber(
  phone: string
): PhoneNormalizationResult {
  const raw = phone.trim();

  if (!raw) {
    return {
      ok: false,
      raw,
      reason: "Phone number was empty."
    };
  }

  const digits = raw.replace(/[^\d]/g, "");

  if (digits.length < 9 || digits.length > 11) {
    return {
      ok: false,
      raw,
      reason: "Please enter a valid phone number, or leave it blank."
    };
  }

  if (/^04\d{8}$/.test(digits)) {
    return {
      ok: true,
      value: `+61${digits.slice(1)}`
    };
  }

  if (/^4\d{8}$/.test(digits)) {
    return {
      ok: true,
      value: `+61${digits}`
    };
  }

  if (/^614\d{8}$/.test(digits)) {
    return {
      ok: true,
      value: `+${digits}`
    };
  }

  if (/^0[2378]\d{8}$/.test(digits)) {
    return {
      ok: true,
      value: `+61${digits.slice(1)}`
    };
  }

  if (/^61[2378]\d{8}$/.test(digits)) {
    return {
      ok: true,
      value: `+${digits}`
    };
  }

  return {
    ok: false,
    raw,
    reason: "Please enter a valid phone number, or leave it blank."
  };
}

export function normalizeAustralianMobilePhone(
  phone: string
): PhoneNormalizationResult {
  const normalized = normalizeAustralianPhoneNumber(phone);

  if (!normalized.ok) {
    return normalized;
  }

  if (!/^\+614\d{8}$/.test(normalized.value)) {
    return {
      ok: false,
      raw: phone.trim(),
      reason: "Phone number is not a valid Australian mobile number."
    };
  }

  return normalized;
}
