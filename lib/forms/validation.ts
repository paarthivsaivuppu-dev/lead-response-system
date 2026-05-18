export function isValidOptionalEmail(value: string) {
  const email = value.trim();

  if (!email) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidOptionalAustralianPhone(value: string) {
  const raw = value.trim();

  if (!raw) {
    return true;
  }

  const digits = raw.replace(/[^\d]/g, "");

  if (digits.length < 9 || digits.length > 11) {
    return false;
  }

  return (
    /^04\d{8}$/.test(digits) ||
    /^4\d{8}$/.test(digits) ||
    /^614\d{8}$/.test(digits) ||
    /^0[2378]\d{8}$/.test(digits) ||
    /^61[2378]\d{8}$/.test(digits)
  );
}
