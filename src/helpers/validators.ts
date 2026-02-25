
// 9 digit validation
export function isNineDigitString(value: unknown): value is string {
  return typeof value === "string" && /^\d{9}$/.test(value);
}