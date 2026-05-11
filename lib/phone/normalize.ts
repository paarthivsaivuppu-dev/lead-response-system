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
export function normalizeAustralianMobilePhone(
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

  return {
    ok: false,
    raw,
    reason: "Phone number is not a valid Australian mobile number."
  };
}
